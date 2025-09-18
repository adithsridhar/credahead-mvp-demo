-- CredAhead MVP Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (automatically created by Supabase Auth, but we need our custom fields)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  literacy_level INTEGER DEFAULT 1 CHECK (literacy_level >= 1 AND literacy_level <= 10),
  assessment_taken BOOLEAN DEFAULT FALSE,
  current_pathway_level INTEGER DEFAULT 1 CHECK (current_pathway_level >= 1 AND current_pathway_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  lesson_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  learning_outcomes JSONB,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
  estimated_duration INTEGER, -- in minutes
  prerequisites TEXT[] DEFAULT '{}',
  completion_rate DECIMAL DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 1),
  avg_quiz_score DECIMAL DEFAULT 0 CHECK (avg_quiz_score >= 0 AND avg_quiz_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_id TEXT UNIQUE NOT NULL,
  lesson_id TEXT REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER CHECK (correct_answer >= 0 AND correct_answer <= 3),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  explanation TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score DECIMAL CHECK (score >= 0 AND score <= 10),
  attempts INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Question tracking table (prevents duplicate questions)
CREATE TABLE IF NOT EXISTS user_question_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(question_id) ON DELETE CASCADE,
  context TEXT NOT NULL, -- 'assessment' or lesson_id
  answered_correctly BOOLEAN,
  difficulty_at_time INTEGER CHECK (difficulty_at_time >= 1 AND difficulty_at_time <= 10),
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id, context)
);

-- Active quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('assessment', 'lesson')),
  current_difficulty DECIMAL DEFAULT 5 CHECK (current_difficulty >= 1 AND current_difficulty <= 10),
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_question_history_user_context ON user_question_history(user_id, context);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_status ON quiz_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_difficulty ON questions(lesson_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration (integrates with Supabase Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, literacy_level, assessment_taken, current_pathway_level)
  VALUES (new.id, new.email, 1, false, 1);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic user creation when someone signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own question history" ON user_question_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question history" ON user_question_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz sessions" ON quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz sessions" ON quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz sessions" ON quiz_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for lessons and questions
CREATE POLICY "Anyone can read lessons" ON lessons
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read questions" ON questions
  FOR SELECT USING (true);

-- Sample data (optional - you can remove this section if you prefer to import via CSV)
/*
-- Sample lessons
INSERT INTO lessons (lesson_id, title, description, level, estimated_duration, prerequisites) VALUES
('lesson_001', 'Introduction to Budgeting', 'Learn the basics of creating and managing a personal budget', 1, 15, '{}'),
('lesson_002', 'Understanding Credit Scores', 'Discover how credit scores work and how to improve them', 2, 20, '{"lesson_001"}'),
('lesson_003', 'Emergency Fund Basics', 'Learn why emergency funds are important and how to build one', 1, 18, '{}'),
('lesson_004', 'Investment Fundamentals', 'Introduction to different types of investments', 3, 25, '{"lesson_001", "lesson_002"}');

-- Sample questions
INSERT INTO questions (question_id, lesson_id, text, options, correct_answer, difficulty, explanation) VALUES
('q_001', 'lesson_001', 'What is the 50/30/20 budgeting rule?', '["50% needs, 30% wants, 20% savings", "50% wants, 30% needs, 20% savings", "50% savings, 30% needs, 20% wants", "50% needs, 30% savings, 20% wants"]', 0, 3, 'The 50/30/20 rule allocates 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.'),
('q_002', 'lesson_002', 'What is considered an excellent credit score?', '["580-669", "670-739", "740-799", "800-850"]', 3, 4, 'Credit scores of 800-850 are considered excellent and qualify for the best interest rates.'),
('q_003', 'lesson_003', 'How many months of expenses should an emergency fund cover?', '["1-2 months", "3-6 months", "8-10 months", "12+ months"]', 1, 2, 'Financial experts typically recommend having 3-6 months of living expenses in an emergency fund.');
*/