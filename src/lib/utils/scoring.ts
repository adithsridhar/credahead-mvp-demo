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