-- Migration: Add name field to users table
-- Run this in your Supabase SQL editor

-- First, add the name column as nullable
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;

-- Set default name for existing users
UPDATE users SET name = 'Adi Test' WHERE name IS NULL;

-- Now make the column NOT NULL
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- Verify the migration
SELECT id, name, email, literacy_level, assessment_taken FROM users;