// Quick script to debug module performance issue
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ryziahtqskgqwtpqdpvb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5emlhaHRxc2tncXd0cHFkcHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Mzk2NTgsImV4cCI6MjA3MzMxNTY1OH0.GvpKm0MRnKSNxiunLczkSiFz-2gzQb87RiFsCuqo7Zc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugModulePerformance() {
  console.log('🔍 Debugging Module Performance Issue\n');
  
  try {
    // 1. Check if modules table exists and has data
    console.log('1. Checking modules table...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*');
    
    console.log('Modules:', modules);
    console.log('Modules error:', modulesError);
    
    // 2. Check questions table structure
    console.log('\n2. Checking questions table structure...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('question_id, lesson_id')
      .limit(5);
      
    console.log('Sample questions:', questions);
    console.log('Questions error:', questionsError);
    
    // 3. Check lessons table and module_id relationship
    console.log('\n3. Checking lessons table and module_id...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('lesson_id, title, module_id')
      .limit(5);
      
    console.log('Sample lessons:', lessons);
    console.log('Lessons error:', lessonsError);
    
    // 4. Try the exact query from modulePerformance.ts
    console.log('\n4. Testing the exact query from modulePerformance.ts...');
    
    if (questions && questions.length > 0) {
      const testQuestionIds = questions.map(q => q.question_id);
      console.log('Testing with question IDs:', testQuestionIds);
      
      const { data: queryResult, error: queryError } = await supabase
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
        .in('question_id', testQuestionIds);
        
      console.log('Query result:', JSON.stringify(queryResult, null, 2));
      console.log('Query error:', queryError);
    }
    
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

debugModulePerformance();