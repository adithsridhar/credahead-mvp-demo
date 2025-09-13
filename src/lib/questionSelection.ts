import { supabase } from '@/lib/supabase';
import { userHistoryCache } from '@/lib/cache/userHistoryCache';
import { getDifficultyLevelRange } from '@/lib/utils/scoring';
import type { Question } from '@/lib/supabase';

export interface QuestionSelectionOptions {
  userId: string;
  context: string; // 'assessment' or lesson_id
  currentDifficulty: number;
  usedQuestionIds: Set<string>;
  lessonId?: string;
}

export async function selectNextQuestion(
  options: QuestionSelectionOptions
): Promise<Question | null> {
  const { userId, context, currentDifficulty, usedQuestionIds, lessonId } = options;
  
  // Get cached history to avoid repeating questions
  const historicalIds = await userHistoryCache.getQuestionHistory(userId, context);
  const excludeIds = new Set([...usedQuestionIds, ...historicalIds]);
  
  // Determine lesson level range for assessment
  let levelRange = { min: 1, max: 10 };
  if (context === 'assessment') {
    levelRange = getDifficultyLevelRange(currentDifficulty);
  }
  
  // Try expanding difficulty range until we find questions
  let searchRange = 0;
  while (searchRange <= 10) {
    const minDiff = Math.max(1, currentDifficulty - searchRange);
    const maxDiff = Math.min(10, currentDifficulty + searchRange);
    
    let query = supabase
      .from('questions')
      .select('*, lessons!inner(level)')
      .gte('difficulty', minDiff)
      .lte('difficulty', maxDiff);
    
    // For assessment, filter by lesson levels
    if (context === 'assessment') {
      query = query
        .gte('lessons.level', levelRange.min)
        .lte('lessons.level', levelRange.max);
    } else if (lessonId) {
      // For lesson quiz, filter by specific lesson
      query = query.eq('lesson_id', lessonId);
    }
    
    // Exclude already used questions
    if (excludeIds.size > 0) {
      query = query.not('question_id', 'in', `(${Array.from(excludeIds).join(',')})`);
    }
    
    const { data: questions, error } = await query.limit(20);
    
    if (error) {
      console.error('Error fetching questions:', error);
      searchRange++;
      continue;
    }
    
    if (questions && questions.length > 0) {
      // Randomly select from available questions
      const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
      return selectedQuestion as Question;
    }
    
    searchRange++;
  }
  
  // If no questions found, try without difficulty constraints
  let fallbackQuery = supabase
    .from('questions')
    .select('*, lessons!inner(level)');
  
  if (context === 'assessment') {
    fallbackQuery = fallbackQuery
      .gte('lessons.level', levelRange.min)
      .lte('lessons.level', levelRange.max);
  } else if (lessonId) {
    fallbackQuery = fallbackQuery.eq('lesson_id', lessonId);
  }
  
  if (excludeIds.size > 0) {
    fallbackQuery = fallbackQuery.not('question_id', 'in', `(${Array.from(excludeIds).join(',')})`);
  }
  
  const { data: fallbackQuestions } = await fallbackQuery.limit(10);
  
  if (fallbackQuestions && fallbackQuestions.length > 0) {
    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)] as Question;
  }
  
  return null;
}

export async function recordQuestionAnswer(
  userId: string,
  questionId: string,
  context: string,
  isCorrect: boolean,
  difficulty: number
): Promise<void> {
  try {
    // Insert into question history
    await supabase
      .from('user_question_history')
      .insert({
        user_id: userId,
        question_id: questionId,
        context,
        answered_correctly: isCorrect,
        difficulty_at_time: difficulty,
      });
    
    // Update cache
    userHistoryCache.addToHistory(userId, context, questionId);
  } catch (error) {
    console.error('Error recording question answer:', error);
  }
}

export async function getQuestionStats(questionId: string) {
  const { data } = await supabase
    .from('user_question_history')
    .select('answered_correctly')
    .eq('question_id', questionId);
  
  if (!data || data.length === 0) {
    return { totalAttempts: 0, correctRate: 0 };
  }
  
  const correctAnswers = data.filter(d => d.answered_correctly).length;
  return {
    totalAttempts: data.length,
    correctRate: correctAnswers / data.length,
  };
}