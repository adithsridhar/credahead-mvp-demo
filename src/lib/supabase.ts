import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (!supabaseUrl.includes('supabase.co')) {
  console.warn('Warning: Supabase URL does not appear to be valid:', supabaseUrl);
}

console.log('Supabase configuration:');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey?.length || 0);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Service role client for admin operations (server-side only)
export const supabaseAdmin = typeof window === 'undefined' ? createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

     // Database types
     export interface User {
       id: string;
       name: string;
       email: string;
       literacy_level: number;
       assessment_taken: boolean;
       current_pathway_level: number;
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
