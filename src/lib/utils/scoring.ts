export interface AssessmentResponse {
  questionId: string;
  isCorrect: boolean;
  difficulty: number;
}

export interface QuizResponse {
  questionId: string;
  isCorrect: boolean;
  difficulty: number;
}

export function calculateLiteracyLevel(responses: AssessmentResponse[]): number {
  const difficultyGroups = new Map<number, { correct: number; total: number }>();
  
  responses.forEach(response => {
    const difficulty = Math.round(response.difficulty);
    if (!difficultyGroups.has(difficulty)) {
      difficultyGroups.set(difficulty, { correct: 0, total: 0 });
    }
    const group = difficultyGroups.get(difficulty)!;
    group.total++;
    if (response.isCorrect) group.correct++;
  });
  
  // Find highest difficulty with ≥75% accuracy (min 2 attempts)
  let finalLevel = 1;
  for (let diff = 10; diff >= 1; diff--) {
    const group = difficultyGroups.get(diff);
    if (group && group.total >= 2) {
      const accuracy = group.correct / group.total;
      if (accuracy >= 0.75) {
        finalLevel = diff;
        break;
      } else if (accuracy >= 0.60 && finalLevel === 1) {
        finalLevel = diff;
      }
    }
  }
  
  return finalLevel;
}

export function calculateQuizScore(responses: QuizResponse[]): number {
  if (responses.length === 0) return 0;
  
  const correctAnswers = responses.filter(r => r.isCorrect).length;
  const totalQuestions = responses.length;
  
  // Calculate percentage and convert to 1-10 scale
  const percentage = (correctAnswers / totalQuestions) * 100;
  return Math.ceil(percentage / 10);
}

export function getDifficultyLevelRange(difficulty: number): { min: number; max: number } {
  if (difficulty <= 3) {
    return { min: 1, max: 3 };
  } else if (difficulty <= 7) {
    return { min: 4, max: 7 };
  } else {
    return { min: 8, max: 10 };
  }
}

export function adjustDifficulty(currentDifficulty: number, isCorrect: boolean): number {
  if (isCorrect) {
    return Math.min(10, currentDifficulty + 0.5);
  } else {
    return Math.max(1, currentDifficulty - 1.0);
  }
}

export interface ScoreRecord {
  score: number;
  is_dummy: boolean;
  created_at: string;
  user_id?: string;
}

export async function calculatePercentile(userScore: number): Promise<number> {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Get all scores from database (both dummy and real)
    const { data: allScores, error } = await supabase
      .from('scores')
      .select('score')
      .order('score', { ascending: true });
    
    if (error) {
      console.error('Error fetching scores for percentile calculation:', error);
      return 50; // Default to 50th percentile if error
    }
    
    if (!allScores || allScores.length === 0) {
      return 50; // Default if no data
    }
    
    const scores = allScores.map(record => record.score);
    const totalCount = scores.length;
    
    // Count scores below user's score
    const countBelow = scores.filter(score => score < userScore).length;
    
    // Count exact ties
    const countTies = scores.filter(score => score === userScore).length;
    
    // Calculate percentile using the formula: (count below + 0.5 * count of ties) / total * 100
    const percentile = ((countBelow + 0.5 * countTies) / totalCount) * 100;
    
    // Round to nearest integer
    return Math.round(percentile);
  } catch (error) {
    console.error('Error in percentile calculation:', error);
    return 50; // Default to 50th percentile if error
  }
}

export async function storeUserScore(userId: string, score: number): Promise<void> {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { error } = await supabase
      .from('scores')
      .insert({
        score: score,
        is_dummy: false,
        user_id: userId
      });
    
    if (error) {
      console.error('Error storing user score:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in storeUserScore:', error);
    throw error;
  }
}