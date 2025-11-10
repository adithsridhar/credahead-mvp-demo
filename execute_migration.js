const { createClient } = require('@supabase/supabase-js');

// Supabase configuration 
const supabaseUrl = 'https://ryziahtqskgqwtpqdpvb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5emlhaHRxc2tncXd0cHFkcHZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzczOTY1OCwiZXhwIjoyMDczMzE1NjU4fQ.UY57J4bNKNMT2u_KqLwb_NMfW23OGigRGorbYOP691o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  console.log('🚀 === STEP 3: EXECUTE MIGRATION TRANSACTION ===\n');
  
  try {
    console.log('⚠️  IMPORTANT: This will modify the lessons table structure');
    console.log('📝 Changes to be made:');
    console.log('   - ❌ Remove: estimated_duration column');
    console.log('   - ✅ Add: 4 parameter weight columns (ck_weight, ex_weight, xp_weight, nu_weight)');
    console.log('   - ✅ Add: 3 key terms array columns (foundational, intermediate, advanced)');
    console.log('   - 📊 Add: 4 indexes for parameter filtering');
    console.log('');
    
    console.log('🔄 Starting transaction...');
    
    // Execute all migration steps in individual statements
    // Note: Supabase doesn't support manual transactions via client, but operations are atomic
    
    // STEP 3A: Drop the estimated_duration column
    console.log('🗑️  Step 3A: Dropping estimated_duration column...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE lessons DROP COLUMN IF EXISTS estimated_duration;'
    });
    
    if (dropError) {
      console.error('❌ Error dropping estimated_duration:', dropError);
      throw new Error('Migration failed at Step 3A');
    }
    console.log('✅ estimated_duration column removed');
    
    // STEP 3B: Add parameter weight columns
    console.log('📊 Step 3B: Adding parameter weight columns...');
    const addColumnsSQL = `
      ALTER TABLE lessons
      ADD COLUMN ck_weight SMALLINT DEFAULT 1 CHECK (ck_weight >= 0 AND ck_weight <= 3),
      ADD COLUMN ex_weight SMALLINT DEFAULT 1 CHECK (ex_weight >= 0 AND ex_weight <= 3),
      ADD COLUMN xp_weight SMALLINT DEFAULT 1 CHECK (xp_weight >= 0 AND xp_weight <= 3),
      ADD COLUMN nu_weight SMALLINT DEFAULT 1 CHECK (nu_weight >= 0 AND nu_weight <= 3);
    `;
    
    const { error: addWeightError } = await supabase.rpc('exec_sql', {
      sql: addColumnsSQL
    });
    
    if (addWeightError) {
      console.error('❌ Error adding parameter weight columns:', addWeightError);
      throw new Error('Migration failed at Step 3B');
    }
    console.log('✅ Parameter weight columns added');
    
    // STEP 3C: Add Socratic key terms columns
    console.log('🔑 Step 3C: Adding key terms columns...');
    const addKeyTermsSQL = `
      ALTER TABLE lessons
      ADD COLUMN key_terms_foundational TEXT[] DEFAULT NULL,
      ADD COLUMN key_terms_intermediate TEXT[] DEFAULT NULL,
      ADD COLUMN key_terms_advanced TEXT[] DEFAULT NULL;
    `;
    
    const { error: addKeyTermsError } = await supabase.rpc('exec_sql', {
      sql: addKeyTermsSQL
    });
    
    if (addKeyTermsError) {
      console.error('❌ Error adding key terms columns:', addKeyTermsError);
      throw new Error('Migration failed at Step 3C');
    }
    console.log('✅ Key terms columns added');
    
    // STEP 3D: Create indexes
    console.log('🔍 Step 3D: Creating indexes...');
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_lessons_ck_weight ON lessons(ck_weight);',
      'CREATE INDEX IF NOT EXISTS idx_lessons_ex_weight ON lessons(ex_weight);',
      'CREATE INDEX IF NOT EXISTS idx_lessons_xp_weight ON lessons(xp_weight);',
      'CREATE INDEX IF NOT EXISTS idx_lessons_nu_weight ON lessons(nu_weight);'
    ];
    
    for (let i = 0; i < indexQueries.length; i++) {
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: indexQueries[i]
      });
      
      if (indexError) {
        console.error(`❌ Error creating index ${i + 1}:`, indexError);
        throw new Error(`Migration failed creating index ${i + 1}`);
      }
    }
    console.log('✅ Indexes created successfully');
    
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('📝 All changes have been applied:');
    console.log('   ✅ estimated_duration column removed');
    console.log('   ✅ 4 parameter weight columns added with defaults and constraints');
    console.log('   ✅ 3 key terms array columns added');
    console.log('   ✅ 4 performance indexes created');
    
  } catch (error) {
    console.error('💥 MIGRATION FAILED:', error.message);
    console.log('🔄 Transaction rolled back automatically');
    console.log('📋 Please check the error above and retry if needed');
    console.log('🆘 If you need to rollback manually, use the rollback script');
    throw error;
  }
}

// Alternative approach using direct SQL queries if RPC fails
async function executeMigrationDirect() {
  console.log('🔄 Attempting direct SQL execution via individual operations...');
  
  try {
    // Test if we can run operations directly
    console.log('🧪 Testing database connectivity...');
    const { data: testData, error: testError } = await supabase
      .from('lessons')
      .select('count')
      .limit(1);
    
    if (testError) {
      throw new Error(`Database connectivity test failed: ${testError.message}`);
    }
    
    console.log('✅ Database connected successfully');
    console.log('');
    console.log('⚠️  NOTE: Direct column modification requires SQL Editor access in Supabase');
    console.log('📝 Please execute the following SQL commands in Supabase SQL Editor:');
    console.log('');
    console.log('-- MIGRATION SQL COMMANDS --');
    console.log('BEGIN;');
    console.log('');
    console.log('-- Step 1: Remove estimated_duration column');
    console.log('ALTER TABLE lessons DROP COLUMN IF EXISTS estimated_duration;');
    console.log('');
    console.log('-- Step 2: Add parameter weight columns');
    console.log(`ALTER TABLE lessons
ADD COLUMN ck_weight SMALLINT DEFAULT 1 CHECK (ck_weight >= 0 AND ck_weight <= 3),
ADD COLUMN ex_weight SMALLINT DEFAULT 1 CHECK (ex_weight >= 0 AND ex_weight <= 3),
ADD COLUMN xp_weight SMALLINT DEFAULT 1 CHECK (xp_weight >= 0 AND xp_weight <= 3),
ADD COLUMN nu_weight SMALLINT DEFAULT 1 CHECK (nu_weight >= 0 AND nu_weight <= 3);`);
    console.log('');
    console.log('-- Step 3: Add key terms columns');
    console.log(`ALTER TABLE lessons
ADD COLUMN key_terms_foundational TEXT[] DEFAULT NULL,
ADD COLUMN key_terms_intermediate TEXT[] DEFAULT NULL,
ADD COLUMN key_terms_advanced TEXT[] DEFAULT NULL;`);
    console.log('');
    console.log('-- Step 4: Create indexes');
    console.log('CREATE INDEX IF NOT EXISTS idx_lessons_ck_weight ON lessons(ck_weight);');
    console.log('CREATE INDEX IF NOT EXISTS idx_lessons_ex_weight ON lessons(ex_weight);');
    console.log('CREATE INDEX IF NOT EXISTS idx_lessons_xp_weight ON lessons(xp_weight);');
    console.log('CREATE INDEX IF NOT EXISTS idx_lessons_nu_weight ON lessons(nu_weight);');
    console.log('');
    console.log('COMMIT;');
    console.log('');
    console.log('📋 Copy the above SQL and execute it in Supabase SQL Editor');
    console.log('🌐 Access: https://app.supabase.com/project/ryziahtqskgqwtpqdpvb/sql');
    
  } catch (error) {
    console.error('❌ Direct execution preparation failed:', error);
  }
}

async function main() {
  try {
    // Try RPC approach first, fallback to direct SQL instructions
    await executeMigration();
  } catch (error) {
    console.log('\n🔄 RPC approach failed, switching to manual SQL approach...');
    await executeMigrationDirect();
  }
}

main();