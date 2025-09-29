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
  try {
    // Use secure server-side API for percentile calculation
    const response = await fetch('/api/scores/percentile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score: userScore }),
    });
    
    if (!response.ok) {
      console.error('Error calling percentile API:', response.status, response.statusText);
      return 50; // Default to 50th percentile if error
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Error in percentile calculation:', data.error);
      return 50; // Default to 50th percentile if error
    }
    
    return data.percentile || 50;
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