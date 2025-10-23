import { createClient } from '@supabase/supabase-js';

// Try environment variables first, then fall back to runtime config
const getConfig = () => {
  if (typeof window !== 'undefined' && (window as any).ENV) {
    return (window as any).ENV;
  }
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
};

const config = getConfig();
const supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = config.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Enhanced environment validation with security checks
function validateEnvironmentVariables() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for missing variables
  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is missing');
  }
  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  }

  // Check for placeholder values (security check)
  if (supabaseUrl && supabaseUrl.includes('your-project-ref')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL appears to be a placeholder value. Please set your actual Supabase URL.');
  }
  if (supabaseAnonKey && supabaseAnonKey.includes('your_supabase_anon_key_here')) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a placeholder value. Please set your actual Supabase anon key.');
  }

  // Check for valid Supabase URL format
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    warnings.push(`Supabase URL format may be invalid: ${supabaseUrl}`);
  }

  // Check for development vs production keys
  if (supabaseAnonKey && supabaseAnonKey.startsWith('eyJ') && supabaseAnonKey.length < 100) {
    warnings.push('Supabase anon key appears to be very short. Please verify it is correct.');
  }

  // Report errors and warnings
  if (errors.length > 0) {
    console.error('❌ Supabase Configuration Errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\n🔧 To fix this:');
    console.error('  1. Copy .env.example to .env.local');
    console.error('  2. Replace placeholder values with your actual Supabase credentials');
    console.error('  3. Get your credentials from: https://app.supabase.com/project/[your-project]/settings/api');
    throw new Error('Supabase configuration is invalid. Check the console for details.');
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Supabase Configuration Warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  // Success message
  console.log('✅ Supabase configuration validated successfully');
  if (process.env.NODE_ENV === 'development') {
    console.log(`📍 Connecting to: ${supabaseUrl}`);
    console.log(`🔑 Using anon key: ${supabaseAnonKey.substring(0, 20)}...`);
  }
}

// Validate environment on module load
validateEnvironmentVariables();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Service role client for admin operations (server-side only)
function createAdminClient() {
  if (typeof window !== 'undefined') {
    return null; // Client-side, no admin client
  }

  // Try environment variable first, then fallback to hardcoded for production
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Force fallback for production deployment when env vars don't work
  if (!serviceRoleKey) {
    console.log('🔧 Using hardcoded service role key fallback');
    serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5emlhaHRxc2tncXd0cHFkcHZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzczOTY1OCwiZXhwIjoyMDczMzE1NjU4fQ.UY57J4bNKNMT2u_KqLwb_NMfW23OGigRGorbYOP691o';
  }
  
  // Validate service role key
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing for admin operations');
    return null;
  }
  
  if (serviceRoleKey.includes('your_supabase_service_role_key_here')) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY appears to be a placeholder value');
    console.error('🔧 Please set your actual Supabase service role key in .env.local');
    return null;
  }

  console.log('✅ Supabase admin client configured for server-side operations');
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export const supabaseAdmin = createAdminClient();

     // Database types
     export interface User {
       id: string;
       name: string;
       email: string;
       literacy_level: number;
       assessment_taken: boolean;
       current_pathway_level: number;
       age_range?: string;
       location?: string;
       occupation?: string;
       survey_completed: boolean;
       created_at: string;
       updated_at: string;
     }

     export interface Module {
       id: number;
       module_id: string;
       name: string;
       created_at: string;
       updated_at: string;
     }

     export interface Lesson {
       id: number;
       lesson_id: string;
       title: string;
       description?: string;
       learning_outcomes?: any;
       level: number;
       estimated_duration?: number;
       prerequisites?: string[];
       completion_rate: number;
       avg_quiz_score: number;
       module_id?: string;
       created_at: string;
     }

     export interface Question {
       id: number;
       question_id: string;
       lesson_id?: string;
       text: string;
       options: any;
       correct_answer: number;
       difficulty: number;
       explanation?: string;
       tags?: string[];
       created_at: string;
     }

     export interface UserProgress {
       id: number;
       user_id: string;
       lesson_id: string;
       completed: boolean;
       score?: number;
       attempts: number;
       completed_at?: string;
     }

     export interface UserQuestionHistory {
       id: number;
       user_id: string;
       question_id: string;
       context: string;
       answered_correctly?: boolean;
       difficulty_at_time?: number;
       answered_at: string;
     }

     export interface QuizSession {
       id: string;
       user_id: string;
       lesson_id?: string;
       session_type: 'assessment' | 'lesson';
       current_difficulty: number;
       questions_answered: number;
       correct_answers: number;
       status: 'active' | 'completed' | 'abandoned';
       started_at: string;
       completed_at?: string;
       last_activity_at: string;
     }

     export interface Score {
       id: number;
       score: number;
       is_dummy: boolean;
       created_at: string;
       user_id?: string;
     }
