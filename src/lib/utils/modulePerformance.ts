import { supabase } from '@/lib/supabase';
import type { AssessmentResponse } from '@/lib/utils/scoring';

export interface ModulePerformance {
  moduleId: string;
  moduleName: string;
  correct: number;
  total: number;
  accuracy: number | null; // null if no questions attempted
}

const MODULE_NAMES = [
  { id: 'MOD001', name: 'Budgeting' },
  { id: 'MOD002', name: 'Saving' },
  { id: 'MOD003', name: 'Credit' },
  { id: 'MOD004', name: 'Investing' },
  { id: 'MOD005', name: 'Insurance' },
  { id: 'MOD006', name: 'Taxes' },
  { id: 'MOD007', name: 'Banking' },
  { id: 'MOD008', name: 'Planning' },
];

export async function calculateModulePerformance(responses: AssessmentResponse[]): Promise<ModulePerformance[]> {
  if (responses.length === 0) {
    // Return all modules with null performance
    return MODULE_NAMES.map(module => ({
      moduleId: module.id,
      moduleName: module.name,
      correct: 0,
      total: 0,
      accuracy: null,
    }));
  }

  try {
    // Get question IDs from responses
    const questionIds = responses.map(r => r.questionId);
    
    // Fetch lesson and module data for these questions
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        question_id,
        lessons(
          module_id,
          modules(
            module_id,
            name
          )
        )
      `)
      .in('question_id', questionIds);

    if (error) {
      console.error('Error fetching question module data:', error);
      return MODULE_NAMES.map(module => ({
        moduleId: module.id,
        moduleName: module.name,
        correct: 0,
        total: 0,
        accuracy: null,
      }));
    }

    // Group responses by module
    const moduleStats = new Map<string, { correct: number; total: number; name: string }>();
    
    // Initialize all modules
    MODULE_NAMES.forEach(module => {
      moduleStats.set(module.id, { correct: 0, total: 0, name: module.name });
    });

    // Process each response
    responses.forEach(response => {
      const questionData = questions?.find(q => q.question_id === response.questionId);
      const lesson = questionData?.lessons as any;
      const moduleData = Array.isArray(lesson?.modules) ? lesson?.modules[0] : lesson?.modules;
      const moduleId = lesson?.module_id || moduleData?.module_id;
      const moduleName = moduleData?.name;
      
      if (moduleId && moduleName) {
        const stats = moduleStats.get(moduleId);
        if (stats) {
          stats.total++;
          if (response.isCorrect) {
            stats.correct++;
          }
          stats.name = moduleName; // Use actual name from database
        }
      }
    });

    // Convert to ModulePerformance array
    return Array.from(moduleStats.entries()).map(([moduleId, stats]) => ({
      moduleId,
      moduleName: stats.name,
      correct: stats.correct,
      total: stats.total,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null,
    }));

  } catch (error) {
    console.error('Error calculating module performance:', error);
    // Fallback to default module names
    return MODULE_NAMES.map(module => ({
      moduleId: module.id,
      moduleName: module.name,
      correct: 0,
      total: 0,
      accuracy: null,
    }));
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}