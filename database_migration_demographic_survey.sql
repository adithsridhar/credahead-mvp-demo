-- Database Migration: Add Demographic Survey Fields
-- Run this SQL in your Supabase SQL Editor to add the demographic survey fields

-- Add demographic fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS survey_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have survey_completed = false
UPDATE users 
SET survey_completed = false 
WHERE survey_completed IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_survey_completed ON users(survey_completed);
CREATE INDEX IF NOT EXISTS idx_users_age_range ON users(age_range);
CREATE INDEX IF NOT EXISTS idx_users_occupation ON users(occupation);

-- Add comments for documentation
COMMENT ON COLUMN users.age_range IS 'User age range from demographic survey (13-17, 18-21, 22-25, 26-30, 30-35, 35-39, 39-50, 50+)';
COMMENT ON COLUMN users.location IS 'User location (city/town) from demographic survey';
COMMENT ON COLUMN users.occupation IS 'User occupation from demographic survey (Student, Salaried Employee, Self Employed, Other)';
COMMENT ON COLUMN users.survey_completed IS 'Whether user has completed the demographic survey';

-- Verification query to check the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('age_range', 'location', 'occupation', 'survey_completed')
ORDER BY column_name;