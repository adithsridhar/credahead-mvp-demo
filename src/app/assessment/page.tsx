'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Container, Box, Typography, LinearProgress, CircularProgress } from '@mui/material';
import { userHistoryCache } from '@/lib/cache/userHistoryCache';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationGuard } from '@/contexts/NavigationGuardContext';
import { selectNextQuestion, recordQuestionAnswer } from '@/lib/questionSelection';
import { calculateLiteracyLevel, adjustDifficulty, type AssessmentResponse } from '@/lib/utils/scoring';
import { supabase, type Question, type QuizSession } from '@/lib/supabase';
import PreAssessmentScreen from './pre-assessment';
import QuestionCard from '@/components/QuestionCard';
import AssessmentResults from '@/components/AssessmentResults';

const TOTAL_QUESTIONS = 24;

export default function AssessmentPage() {
  const router = useRouter();
  const { user, appUser, refreshAppUser } = useAuth();
  const { setQuizActive } = useNavigationGuard();
  const [showPreAssessment, setShowPreAssessment] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    duration: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // 5-minute inactivity timeout
  useInactivityTimeout(5 * 60 * 1000, async () => {
    if (sessionId) {
      await supabase
        .from('quiz_sessions')
        .update({ status: 'abandoned' })
        .eq('id', sessionId);
      setQuizActive(false);
      router.push('/');
    }
  });

  const startAssessment = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Abandon any existing assessment session
      const { data: activeSession } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_type', 'assessment')
        .eq('status', 'active')
        .maybeSingle();

      if (activeSession) {
        await supabase
          .from('quiz_sessions')
          .update({ status: 'abandoned' })
          .eq('id', activeSession.id);
        
        userHistoryCache.invalidateContext(user.id, 'assessment');
      }

      // Create new session
      const { data: newSession, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          session_type: 'assessment',
          current_difficulty: 5,
          questions_answered: 0,
          correct_answers: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(newSession.id);
      setShowPreAssessment(false);
      setQuizActive(true);
      setStartTime(Date.now());
      await loadNextQuestion();
    } catch (error) {
      console.error('Error starting assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextQuestion = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const question = await selectNextQuestion({
        userId: user.id,
        context: 'assessment',
        currentDifficulty,
        usedQuestionIds,
      });

      if (question) {
        setCurrentQuestion(question);
        setUsedQuestionIds(prev => new Set([...Array.from(prev), question.question_id]));
      } else {
        console.error('No questions available');
        // Complete assessment if no questions available
        await completeAssessment();
      }
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentDifficulty, usedQuestionIds]);

  const handleAnswer = async (selectedOption: number, question: Question) => {
    if (!user || !sessionId) return;

    try {
      setIsLoading(true);
      const isCorrect = selectedOption === question.correct_answer;
      
      // Record the response
      const response: AssessmentResponse = {
        questionId: question.question_id,
        isCorrect,
        difficulty: question.difficulty,
      };
      
      setResponses(prev => [...prev, response]);

      // Record in database
      await recordQuestionAnswer(
        user.id,
        question.question_id,
        'assessment',
        isCorrect,
        question.difficulty
      );

      // Update difficulty
      const newDifficulty = adjustDifficulty(currentDifficulty, isCorrect);
      setCurrentDifficulty(newDifficulty);

      // Update session
      const correctAnswers = responses.filter(r => r.isCorrect).length + (isCorrect ? 1 : 0);
      await supabase
        .from('quiz_sessions')
        .update({
          last_activity_at: new Date().toISOString(),
          questions_answered: questionIndex + 1,
          correct_answers: correctAnswers,
          current_difficulty: newDifficulty,
        })
        .eq('id', sessionId);

      // Move to next question or complete assessment
      const nextQuestionIndex = questionIndex + 1;
      setQuestionIndex(nextQuestionIndex);

      if (nextQuestionIndex >= TOTAL_QUESTIONS) {
        await completeAssessment();
      } else {
        await loadNextQuestion();
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeAssessment = async () => {
    if (!user || !sessionId) return;

    try {
      setIsCompleting(true);
      
      const finalResponses = responses.length > 0 ? responses : [];
      const literacyLevel = calculateLiteracyLevel(finalResponses);
      const correctAnswers = finalResponses.filter(r => r.isCorrect).length;
      const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

      // Update user's literacy level
      await supabase
        .from('users')
        .update({
          literacy_level: literacyLevel,
          assessment_taken: true,
          current_pathway_level: Math.min(literacyLevel + 1, 10),
        })
        .eq('id', user.id);

      // Complete session
      await supabase
        .from('quiz_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      // Refresh user data
      await refreshAppUser();

      // Set results and show results screen
      setAssessmentResults({
        score: literacyLevel,
        correctAnswers: correctAnswers,
        totalQuestions: TOTAL_QUESTIONS,
        duration: duration,
      });
      setQuizActive(false);
      setShowResults(true);
    } catch (error) {
      console.error('Error completing assessment:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleContinueFromResults = async () => {
    // Refresh user data one more time before navigating
    await refreshAppUser();
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Please sign in to take the assessment
        </Typography>
      </Container>
    );
  }

  if (showPreAssessment) {
    return <PreAssessmentScreen onStart={startAssessment} />;
  }

  if (isCompleting) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress size={60} sx={{ color: '#FF6B35', mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Processing your results...
        </Typography>
      </Container>
    );
  }

  if (showResults && assessmentResults) {
    return (
      <AssessmentResults
        score={assessmentResults.score}
        correctAnswers={assessmentResults.correctAnswers}
        totalQuestions={assessmentResults.totalQuestions}
        duration={assessmentResults.duration}
        responses={responses}
        onContinue={handleContinueFromResults}
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Progress Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" align="center" gutterBottom sx={{ color: '#E0E0E0' }}>
          Question {questionIndex + 1} of {TOTAL_QUESTIONS}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(questionIndex / TOTAL_QUESTIONS) * 100}
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
            Progress: {Math.round((questionIndex / TOTAL_QUESTIONS) * 100)}%
          </Typography>
        </Box>
      </Box>

      {/* Question Display */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justify: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ color: '#FF6B35' }} />
        </Box>
      ) : currentQuestion ? (
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          disabled={isLoading}
        />
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error">
            No questions available. Please try again later.
          </Typography>
        </Box>
      )}
    </Container>
  );
}