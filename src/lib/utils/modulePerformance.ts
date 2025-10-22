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
  { id: 'M001', name: 'Money Fundamentals' },
  { id: 'M002', name: 'Introduction to Banking' },
  { id: 'M003', name: 'UPI & Digital Banking' },
  { id: 'M004', name: 'Saving' },
  { id: 'M005', name: 'Investing' },
  { id: 'M006', name: 'Borrowing & Debt' },
  { id: 'M007', name: 'Credit & Credit Score' },
  { id: 'M008', name: 'Financial Planning & Security' },
];

export async function calculateModulePerformance(responses: AssessmentResponse[]): Promise<ModulePerformance[]> {
  console.log('🔍 calculateModulePerformance called with responses:', responses?.length || 0);
  console.log('🔍 Responses type:', typeof responses);
  console.log('🔍 Responses is array:', Array.isArray(responses));
  console.log('🔍 First response sample:', responses?.[0]);
  
  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    console.log('⚠️ No valid responses provided, returning default modules with null performance');
    console.log('⚠️ Responses value:', responses);
    // Return all modules with null performance
    return MODULE_NAMES.map(module => ({
      moduleId: module.id,
      moduleName: module.name,
      correct: 0,
      total: 0,
      accuracy: null,
    }));
  }
  
  // FORCE LOGGING TO ENSURE WE SEE THIS
  console.error('🚨 PROCESSING RESPONSES - LENGTH:', responses.length);
  console.error('🚨 SAMPLE RESPONSE:', responses[0]);
  
  console.log('✅ Valid responses found, proceeding with calculation...');

  try {
    // Get question IDs from responses
    const questionIds = responses.map(r => r.questionId);
    console.log('📝 Question IDs from responses:', questionIds);
    
    // Fetch lesson and module data for these questions
    console.log('🔍 Executing Supabase query for questions with IDs:', questionIds);
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

    console.log('📊 Supabase query result:');
    console.log('  - Error:', error);
    console.log('  - Data:', JSON.stringify(questions, null, 2));

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
    console.log('🏗️ Initializing module stats with MODULE_NAMES:', MODULE_NAMES);
    MODULE_NAMES.forEach(module => {
      moduleStats.set(module.id, { correct: 0, total: 0, name: module.name });
    });

    // Process each response
    console.log('🔄 Processing responses to calculate module performance...');
    responses.forEach((response, index) => {
      console.log(`\n📋 Processing response ${index + 1}/${responses.length}:`);
      console.log('  - Response:', response);
      
      const questionData = questions?.find(q => q.question_id === response.questionId);
      console.log('  - Found question data:', questionData);
      
      const lesson = questionData?.lessons as any;
      console.log('  - Lesson data:', lesson);
      
      const moduleData = Array.isArray(lesson?.modules) ? lesson?.modules[0] : lesson?.modules;
      console.log('  - Module data:', moduleData);
      
      const moduleId = lesson?.module_id || moduleData?.module_id;
      const moduleName = moduleData?.name;
      console.log('  - Extracted moduleId:', moduleId);
      console.log('  - Extracted moduleName:', moduleName);
      
      if (moduleId && moduleName) {
        const stats = moduleStats.get(moduleId);
        console.log('  - Found stats for module:', stats);
        if (stats) {
          stats.total++;
          if (response.isCorrect) {
            stats.correct++;
          }
          stats.name = moduleName; // Use actual name from database
          console.log('  - Updated stats:', stats);
        } else {
          console.log('  - ⚠️ No stats found for moduleId:', moduleId);
        }
      } else {
        console.log('  - ⚠️ Missing moduleId or moduleName, skipping response');
      }
    });

    console.log('\n📈 Final module stats:', Object.fromEntries(moduleStats));

    // Convert to ModulePerformance array
    const result = Array.from(moduleStats.entries()).map(([moduleId, stats]) => ({
      moduleId,
      moduleName: stats.name,
      correct: stats.correct,
      total: stats.total,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null,
    }));
    
    console.log('🎯 Final calculated module performance:', result);
    return result;

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