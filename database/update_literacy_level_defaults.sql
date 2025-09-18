-- Migration: Update literacy level defaults and existing data
-- Run this in your Supabase SQL editor

-- Step 1: Update existing users who haven't taken assessment to literacy_level = 1
UPDATE users 
SET literacy_level = 1, current_pathway_level = 1
WHERE assessment_taken = false;

-- Step 2: Update the database trigger to use literacy_level = 1 as default
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert user with literacy_level = 1 for new users (before assessment)
  INSERT INTO public.users (id, email, name, literacy_level, assessment_taken, current_pathway_level)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'User'), -- Use metadata name or default
    1, -- Start with literacy level 1 (beginner)
    false, 
    1 -- Start with pathway level 1
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Update table defaults for future manual insertions
ALTER TABLE users ALTER COLUMN literacy_level SET DEFAULT 1;
ALTER TABLE users ALTER COLUMN current_pathway_level SET DEFAULT 1;

-- Step 4: Verify the changes
SELECT 
  'Updated users with assessment_taken = false' as description,
  COUNT(*) as count
FROM users 
WHERE assessment_taken = false AND literacy_level = 1

UNION ALL

SELECT 
  'Total users in system' as description,
  COUNT(*) as count
FROM users;