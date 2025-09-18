-- Migration: Fix user creation trigger to handle name field properly
-- Run this in your Supabase SQL editor

-- Drop the existing trigger function and recreate it
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Updated function to handle user registration with optional name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert user with default name that can be updated later
  INSERT INTO public.users (id, email, name, literacy_level, assessment_taken, current_pathway_level)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'User'), -- Use metadata name or default
    5, 
    false, 
    2
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';