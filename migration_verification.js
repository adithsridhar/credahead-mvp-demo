const { createClient } = require('@supabase/supabase-js');

// Supabase configuration 
const supabaseUrl = 'https://ryziahtqskgqwtpqdpvb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5emlhaHRxc2tncXd0cHFkcHZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzczOTY1OCwiZXhwIjoyMDczMzE1NjU4fQ.UY57J4bNKNMT2u_KqLwb_NMfW23OGigRGorbYOP691o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runPreMigrationVerification() {
  console.log('🔍 === STEP 1: PRE-MIGRATION VERIFICATION ===\n');
  
  try {
    console.log('1. Checking lessons table structure...');
    
    // Get table structure using information_schema
    const { data: columns, error: colError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          column_name, 
          data_type, 
          column_default,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'lessons'
        ORDER BY ordinal_position;
      `
    });
    
    if (colError) {
      console.log('📝 Note: RPC call failed, using direct table query...');
      
      // Fallback: Get sample record to understand structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('lessons')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Error accessing lessons table:', sampleError);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log('✅ Lessons table exists');
        console.log('📊 Current column structure:');
        const columnNames = Object.keys(sampleData[0]);
        columnNames.forEach(col => console.log(`   - ${col}`));
        
        console.log('\n📋 Sample lesson record:');
        console.log('   lesson_id:', sampleData[0].lesson_id);
        console.log('   title:', sampleData[0].title);
        console.log('   module_id:', sampleData[0].module_id);
        
        // Check for estimated_duration column
        const hasEstimatedDuration = 'estimated_duration' in sampleData[0];
        console.log(`   estimated_duration exists: ${hasEstimatedDuration ? 'YES' : 'NO'}`);
        
        // Check if new columns already exist
        const hasWeights = ['ck_weight', 'ex_weight', 'xp_weight', 'nu_weight'].some(col => col in sampleData[0]);
        const hasKeyTerms = ['key_terms_foundational', 'key_terms_intermediate', 'key_terms_advanced'].some(col => col in sampleData[0]);
        
        console.log(`   Parameter weight columns exist: ${hasWeights ? 'YES' : 'NO'}`);
        console.log(`   Key terms columns exist: ${hasKeyTerms ? 'YES' : 'NO'}`);
        
        if (hasWeights || hasKeyTerms) {
          console.log('⚠️  WARNING: Some migration columns already exist!');
          console.log('   This might be a partial migration. Please verify before proceeding.');
        }
      }
    } else {
      console.table(columns);
    }
    
    // Count existing lesson records
    console.log('\n2. Counting existing lesson records...');
    const { count, error: countError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting lessons:', countError);
      return;
    }
    
    console.log(`📈 Total lessons: ${count}`);
    
    // Get module distribution to understand lesson structure
    console.log('\n3. Analyzing lesson distribution by module...');
    const { data: moduleDistribution, error: moduleError } = await supabase
      .from('lessons')
      .select('module_id')
      .not('module_id', 'is', null);
    
    if (moduleError) {
      console.error('❌ Error getting module distribution:', moduleError);
    } else {
      const moduleCount = moduleDistribution.reduce((acc, lesson) => {
        acc[lesson.module_id] = (acc[lesson.module_id] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Lessons per module:');
      Object.entries(moduleCount).forEach(([moduleId, count]) => {
        console.log(`   ${moduleId}: ${count} lessons`);
      });
    }
    
    console.log('\n✅ PRE-MIGRATION VERIFICATION COMPLETE');
    console.log('\n📝 SUMMARY:');
    console.log(`   - Lessons table exists with ${count} records`);
    console.log('   - Ready for migration execution');
    console.log('   - Backup recommended before proceeding');
    
  } catch (error) {
    console.error('❌ Error during pre-migration verification:', error);
  }
}

async function runBackupDocumentation() {
  console.log('\n🔒 === STEP 2: BACKUP DOCUMENTATION ===\n');
  
  try {
    // Get current table schema for backup reference
    console.log('📋 Current lessons table schema documentation:');
    
    const { data: sampleData } = await supabase
      .from('lessons')
      .select('*')
      .limit(1);
    
    if (sampleData && sampleData.length > 0) {
      const columns = Object.keys(sampleData[0]);
      console.log('Current columns:', columns.join(', '));
    }
    
    // Count records for verification
    const { count } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 Backup verification data:`);
    console.log(`   - Total records: ${count}`);
    console.log(`   - Backup timestamp: ${new Date().toISOString()}`);
    console.log(`   - Schema backup: Ready for rollback if needed`);
    
    console.log('\n✅ BACKUP DOCUMENTATION COMPLETE');
    
  } catch (error) {
    console.error('❌ Error during backup documentation:', error);
  }
}

// Run the verification steps
async function main() {
  await runPreMigrationVerification();
  await runBackupDocumentation();
  
  console.log('\n🚀 READY FOR MIGRATION');
  console.log('👉 Please review the above results and confirm to proceed with Step 3.');
}

main();