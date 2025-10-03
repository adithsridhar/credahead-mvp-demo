'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Container, Box, Typography, CircularProgress, Button, Card, CardContent, LinearProgress } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationGuard } from '@/contexts/NavigationGuardContext';
import { supabase, type Question, type Lesson } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';
import FeedbackPopup from '@/components/FeedbackPopup';

const TOTAL_QUESTIONS = 10;

interface QuestionResult {
  questionId: string;
  difficulty: number;
  correct: boolean;
  userAnswer: number;
  correctAnswer: number;
}

interface QuizResults {
  totalCorrect: number;
  totalQuestions: number;
  percentage: number;
  difficultyBreakdown: {
    difficulty: number;
    correct: number;
    total: number;
    percentage: number;
  }[];
  completed: boolean;
  maxDifficultyAchieved: number;
  message: string;
}

export default function LessonQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setQuizActive } = useNavigationGuard();
  const lessonId = params.lessonId as string;

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  const [lessonMin, setLessonMin] = useState(1);
  const [lessonMax, setLessonMax] = useState(10);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [maxDifficultyAnsweredCorrectly, setMaxDifficultyAnsweredCorrectly] = useState(0);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  const [continueEnabled, setContinueEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

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

  // Find closest available difficulty question
  const findClosestQuestion = (targetDifficulty: number, questions: Question[], usedIds: string[]): Question | null => {
    const unusedQuestions = questions.filter(q => !usedIds.includes(q.question_id));
    
    if (unusedQuestions.length === 0) return null;
    
    // Find question with closest difficulty (Option 2: closest overall)
    return unusedQuestions.reduce((prev, curr) => 
      Math.abs(curr.difficulty - targetDifficulty) < Math.abs(prev.difficulty - targetDifficulty) ? curr : prev
    );
  };

  // Update difficulty based on answer
  const updateDifficulty = (current: number, correct: boolean): number => {
    const adjustment = correct ? 0.5 : -1.0;
    const newDifficulty = current + adjustment;
    // Apply floor/ceiling constraints
    return Math.max(lessonMin, Math.min(newDifficulty, lessonMax));
  };

  // Select next question based on current difficulty
  const selectNextQuestion = useCallback(async (targetDifficulty: number, questions: Question[], usedIds: string[]) => {
    // Round down to nearest whole number for question selection
    const questionDifficulty = Math.floor(targetDifficulty);
    
    // Find closest available question
    const question = findClosestQuestion(questionDifficulty, questions, usedIds);
    
    if (question) {
      setCurrentQuestion(question);
    } else {
      console.error('No available questions found');
      await completeQuiz();
    }
  }, []);

  // Initialize quiz by loading questions and setting difficulty range
  const initializeQuiz = useCallback(async () => {
    if (!lessonId || !user) return;

    try {
      setIsLoading(true);
      
      // Fetch all questions for this lesson
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('lesson_id', lessonId);

      if (error || !questions || questions.length === 0) {
        console.error('No questions found for lesson:', error);
        return;
      }

      // Set available questions
      setAvailableQuestions(questions);

      // Calculate lesson difficulty range
      const difficulties = questions.map(q => q.difficulty).filter(d => d != null);
      const min = Math.min(...difficulties);
      const max = Math.max(...difficulties);
      
      setLessonMin(min);
      setLessonMax(max);
      setCurrentDifficulty(min); // Start at lesson minimum
      
      // Load first question
      setQuizActive(true);
      await selectNextQuestion(min, questions, []);
    } catch (error) {
      console.error('Error initializing quiz:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, user, selectNextQuestion]);

  // Handle answer submission
  const handleAnswer = async (selectedOption: number, question: Question) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const isCorrect = selectedOption === question.correct_answer;
      
      // Store result
      const result: QuestionResult = {
        questionId: question.question_id,
        difficulty: question.difficulty,
        correct: isCorrect,
        userAnswer: selectedOption,
        correctAnswer: question.correct_answer,
      };
      
      setQuestionResults(prev => [...prev, result]);
      
      // Update max difficulty answered correctly
      if (isCorrect && question.difficulty > maxDifficultyAnsweredCorrectly) {
        setMaxDifficultyAnsweredCorrectly(question.difficulty);
      }
      
      // Update difficulty for next question
      const newDifficulty = updateDifficulty(currentDifficulty, isCorrect);
      setCurrentDifficulty(newDifficulty);
      
      // Add to used questions
      setUsedQuestionIds(prev => [...prev, question.question_id]);
      
      // Record in database
      await supabase
        .from('user_question_history')
        .upsert({
          user_id: user.id,
          question_id: question.question_id,
          context: lessonId,
          answered_correctly: isCorrect,
          difficulty_at_time: question.difficulty,
        });

      // Show feedback popup
      setFeedbackData({
        isCorrect,
        explanation: question.explanation || 'No explanation available'
      });
      setShowFeedback(true);
      setContinueEnabled(false);

      // Enable continue button after 5 seconds
      setTimeout(() => {
        setContinueEnabled(true);
      }, 5000);

    } catch (error) {
      console.error('Error handling answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue after feedback
  const handleContinue = async () => {
    setShowFeedback(false);
    setContinueEnabled(false);
    setQuestionsAnswered(prev => prev + 1);

    if (questionsAnswered + 1 >= TOTAL_QUESTIONS) {
      await completeQuiz();
    } else {
      await selectNextQuestion(currentDifficulty, availableQuestions, usedQuestionIds);
    }
  };

  // Calculate quiz results
  const calculateResults = (): QuizResults => {
    const totalCorrect = questionResults.filter(r => r.correct).length;
    const percentage = Math.round((totalCorrect / TOTAL_QUESTIONS) * 100);
    
    // Group by difficulty
    const difficultyGroups: { [key: number]: { correct: number; total: number } } = {};
    
    questionResults.forEach(result => {
      if (!difficultyGroups[result.difficulty]) {
        difficultyGroups[result.difficulty] = { correct: 0, total: 0 };
      }
      difficultyGroups[result.difficulty].total++;
      if (result.correct) {
        difficultyGroups[result.difficulty].correct++;
      }
    });
    
    const difficultyBreakdown = Object.entries(difficultyGroups).map(([diff, stats]) => ({
      difficulty: parseInt(diff),
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100),
    })).sort((a, b) => a.difficulty - b.difficulty);
    
    const completed = maxDifficultyAnsweredCorrectly >= lessonMax;
    
    // Dynamic messages based on performance
    let message: string;
    if (completed && percentage >= 90) {
      message = "Outstanding! You've mastered this lesson with excellent performance at all levels.";
    } else if (completed && percentage >= 70) {
      message = "Great work! You've successfully completed this lesson and demonstrated solid understanding.";
    } else if (completed) {
      message = "Well done! You've completed the lesson. Consider reviewing the concepts to strengthen your understanding.";
    } else if (percentage >= 80) {
      message = "Good effort! You've shown strong understanding but need to tackle the highest difficulty questions to complete the lesson.";
    } else if (percentage >= 60) {
      message = "Nice try! Review the lesson materials and practice more to improve your performance and complete the lesson.";
    } else {
      message = "Keep practicing! Review the fundamentals and try again to strengthen your understanding of these concepts.";
    }
    
    return {
      totalCorrect,
      totalQuestions: TOTAL_QUESTIONS,
      percentage,
      difficultyBreakdown,
      completed,
      maxDifficultyAchieved: maxDifficultyAnsweredCorrectly,
      message,
    };
  };

  // Complete quiz and show results
  const completeQuiz = async () => {
    if (!user) return;

    try {
      const results = calculateResults();
      setQuizResults(results);
      
      // Update database if lesson completed
      if (results.completed) {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            attempts: 1, // Should be incremented properly
            completed_at: new Date().toISOString(),
          });
      }
      
      setQuizActive(false);
      setShowResults(true);
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  };

  // Return to pathway
  const returnToPathway = () => {
    router.push('/pathway');
  };

  // Initialize quiz on mount
  useEffect(() => {
    if (user && lessonId && !showResults) {
      initializeQuiz();
    }
  }, [user, lessonId, showResults, initializeQuiz]);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Please sign in to take this lesson
        </Typography>
      </Container>
    );
  }

  if (showResults && quizResults) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
        <Card sx={{ backgroundColor: '#4a4a4a', borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ 
              color: '#FF6B35', 
              fontWeight: 'bold', 
              textAlign: 'center',
              mb: 2,
              fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.75rem' }
            }}>
              Quiz Results
            </Typography>
            
            <Typography variant="h5" sx={{ 
              color: quizResults.completed ? '#4CAF50' : '#F44336',
              textAlign: 'center',
              mb: 4,
              fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' }
            }}>
              {quizResults.completed ? '✅ Lesson Completed!' : '❌ Lesson Incomplete'}
            </Typography>

            {/* Overall Score */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#E0E0E0', mb: 2 }}>
                Overall Score: {quizResults.totalCorrect}/{quizResults.totalQuestions} ({quizResults.percentage}%)
              </Typography>
            </Box>

            {/* Performance by Difficulty */}
            <Typography variant="h6" sx={{ color: '#FF6B35', mb: 3 }}>
              Performance by Difficulty Level:
            </Typography>
            
            {quizResults.difficultyBreakdown.map(level => (
              <Box key={level.difficulty} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#E0E0E0' }}>
                    Level {level.difficulty}
                  </Typography>
                  <Typography sx={{ color: '#E0E0E0' }}>
                    {level.correct}/{level.total} ({level.percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={level.percentage}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: level.percentage === 100 ? '#4CAF50' : 
                                      level.percentage >= 75 ? '#FF9800' : 
                                      level.percentage >= 50 ? '#2196F3' : '#F44336',
                      borderRadius: 6,
                    },
                  }}
                />
              </Box>
            ))}

            {/* Message */}
            <Typography variant="body1" sx={{ 
              color: '#E0E0E0', 
              textAlign: 'center',
              mt: 4,
              mb: 4,
              fontStyle: 'italic'
            }}>
              {quizResults.message}
            </Typography>

            {/* Continue Button */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={returnToPathway}
                sx={{ 
                  backgroundColor: '#FF6B35',
                  '&:hover': { backgroundColor: '#e55a2b' },
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem'
                }}
              >
                Continue to Learning Pathway
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh', position: 'relative' }}>
      {/* Header Row */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        px: 2
      }}>
        {/* Level - Left */}
        <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
          Level {lesson?.level || '-'}
        </Typography>
        
        {/* Lesson Title - Center */}
        <Typography variant="h4" sx={{ 
          color: '#FF6B35', 
          fontWeight: 'bold',
          textAlign: 'center',
          flexGrow: 1,
          mx: 4,
          fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.75rem' }
        }}>
          {lesson?.title?.toUpperCase() || 'LESSON'}
        </Typography>
        
        {/* Question Counter - Right */}
        <Typography variant="h6" sx={{ color: '#E0E0E0', fontWeight: 'bold' }}>
          Q {questionsAnswered + 1}/{TOTAL_QUESTIONS}
        </Typography>
      </Box>

      {/* Progress Bar - Centered */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        mb: 4
      }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
            let color = 'rgba(255, 255, 255, 0.2)'; // Empty/unanswered
            if (index < questionResults.length) {
              color = questionResults[index].correct ? '#4CAF50' : '#F44336'; // Green for correct, red for incorrect
            }
            
            return (
              <Box
                key={index}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  borderRadius: 1,
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Question Display */}
      {isLoading && !showFeedback ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
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