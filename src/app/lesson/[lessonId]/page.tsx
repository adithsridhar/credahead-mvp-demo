'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Container, Box, Typography, LinearProgress, CircularProgress, Button } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { userHistoryCache } from '@/lib/cache/userHistoryCache';
import { selectNextQuestion, recordQuestionAnswer } from '@/lib/questionSelection';
import { calculateQuizScore, adjustDifficulty, type QuizResponse } from '@/lib/utils/scoring';
import { supabase, type Question, type QuizSession, type Lesson } from '@/lib/supabase';
import { updateUserLiteracyLevel } from '@/lib/pathwayGeneration';
import QuestionCard from '@/components/QuestionCard';
import FeedbackPopup from '@/components/FeedbackPopup';

const TOTAL_QUESTIONS = 10;
const PASSING_SCORE = 8;

export default function LessonQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshAppUser } = useAuth();
  const lessonId = params.lessonId as string;

  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  const [continueEnabled, setContinueEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Fetch lesson details
  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('lesson_id', lessonId)
        .single();

      if (error) throw error;
      return data as Lesson;
    },
    enabled: !!lessonId,
  });

  // 5-minute inactivity timeout
  useInactivityTimeout(5 * 60 * 1000, async () => {
    if (session) {
      await supabase
        .from('quiz_sessions')
        .update({ status: 'abandoned' })
        .eq('id', session.id);
      router.push('/pathway');
    }
  });

  const startQuiz = useCallback(async () => {
    if (!user || !lessonId) return;

    try {
      setIsLoading(true);

      // Abandon any existing session for this lesson
      const { data: activeSession } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('status', 'active')
        .maybeSingle();

      if (activeSession) {
        await supabase
          .from('quiz_sessions')
          .update({ status: 'abandoned' })
          .eq('id', activeSession.id);
        
        userHistoryCache.invalidateContext(user.id, lessonId);
      }

      // Create new session
      const { data: newSession, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          session_type: 'lesson',
          current_difficulty: 5,
          questions_answered: 0,
          correct_answers: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setSession(newSession);
      await loadNextQuestion();
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, lessonId]);

  const loadNextQuestion = useCallback(async () => {
    if (!user || !lessonId) return;

    try {
      setIsLoading(true);
      
      const question = await selectNextQuestion({
        userId: user.id,
        context: lessonId,
        currentDifficulty,
        usedQuestionIds,
        lessonId,
      });

      if (question) {
        setCurrentQuestion(question);
        setUsedQuestionIds(prev => new Set([...Array.from(prev), question.question_id]));
      } else {
        console.error('No questions available for this lesson');
        await completeQuiz();
      }
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, lessonId, currentDifficulty, usedQuestionIds]);

  const handleAnswer = async (selectedOption: number, question: Question) => {
    if (!user || !session) return;

    try {
      setIsLoading(true);
      const isCorrect = selectedOption === question.correct_answer;
      
      // Store response
      const response: QuizResponse = {
        questionId: question.question_id,
        isCorrect,
        difficulty: question.difficulty,
      };
      
      setResponses(prev => [...prev, response]);

      // Record in database
      await recordQuestionAnswer(
        user.id,
        question.question_id,
        lessonId,
        isCorrect,
        question.difficulty
      );

      // Update difficulty
      const newDifficulty = adjustDifficulty(currentDifficulty, isCorrect);
      setCurrentDifficulty(newDifficulty);

      // Show feedback popup
      setFeedbackData({
        isCorrect,
        explanation: question.explanation || 'No explanation available'
      });
      setShowFeedback(true);
      setContinueEnabled(false);

      // Enable continue button after 10 seconds
      setTimeout(() => {
        setContinueEnabled(true);
      }, 10000);

      // Update session
      const correctAnswers = responses.filter(r => r.isCorrect).length + (isCorrect ? 1 : 0);
      await supabase
        .from('quiz_sessions')
        .update({
          last_activity_at: new Date().toISOString(),
          questions_answered: questionsAnswered + 1,
          correct_answers: correctAnswers,
          current_difficulty: newDifficulty,
        })
        .eq('id', session.id);

    } catch (error) {
      console.error('Error handling answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    setShowFeedback(false);
    setContinueEnabled(false);
    setQuestionsAnswered(prev => prev + 1);

    if (questionsAnswered + 1 >= TOTAL_QUESTIONS) {
      await completeQuiz();
    } else {
      await loadNextQuestion();
    }
  };

  const completeQuiz = async () => {
    if (!user || !session) return;

    try {
      setIsCompleting(true);
      
      const finalScore = calculateQuizScore(responses);
      const passed = finalScore >= PASSING_SCORE;

      // Mark lesson as completed if passed
      if (passed) {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            score: finalScore,
            completed_at: new Date().toISOString(),
            attempts: 1, // This should be incremented properly in a real app
          });

        // Update user's literacy level
        await updateUserLiteracyLevel(user.id);
        await refreshAppUser();
      }

      // Complete session
      await supabase
        .from('quiz_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      // Navigate back to pathway
      router.push('/pathway');
    } catch (error) {
      console.error('Error completing quiz:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  // Start quiz on component mount
  useEffect(() => {
    if (user && lessonId && !session) {
      startQuiz();
    }
  }, [user, lessonId, session, startQuiz]);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Please sign in to take this lesson
        </Typography>
      </Container>
    );
  }

  if (isCompleting) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress size={60} sx={{ color: '#FF6B35', mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Completing lesson...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      {lesson && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
            {lesson.title}
          </Typography>
          {lesson.description && (
            <Typography variant="h6" sx={{ color: '#E0E0E0', mb: 2 }}>
              {lesson.description}
            </Typography>
          )}
        </Box>
      )}

      {/* Progress Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" align="center" gutterBottom sx={{ color: '#E0E0E0' }}>
          Question {questionsAnswered + 1} of {TOTAL_QUESTIONS}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(questionsAnswered / TOTAL_QUESTIONS) * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#FF6B35',
            },
          }}
        />
        <Box sx={{ mt: 2, display: 'flex', justify: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
            Current Difficulty: {currentDifficulty.toFixed(1)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
            Progress: {Math.round((questionsAnswered / TOTAL_QUESTIONS) * 100)}%
          </Typography>
        </Box>
      </Box>

      {/* Question Display */}
      {isLoading && !showFeedback ? (
        <Box sx={{ display: 'flex', justify: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ color: '#FF6B35' }} />
        </Box>
      ) : currentQuestion ? (
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          disabled={isLoading || showFeedback}
        />
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            No questions available for this lesson.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/pathway')}
            sx={{ backgroundColor: '#FF6B35' }}
          >
            Return to Pathway
          </Button>
        </Box>
      )}

      {/* Feedback Popup */}
      {showFeedback && feedbackData && (
        <FeedbackPopup
          isCorrect={feedbackData.isCorrect}
          explanation={feedbackData.explanation}
          continueEnabled={continueEnabled}
          onContinue={handleContinue}
          open={showFeedback}
        />
      )}
    </Container>
  );
}