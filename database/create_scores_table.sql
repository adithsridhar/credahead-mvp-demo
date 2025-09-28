-- Create scores table for percentile calculation system
-- This table will store assessment scores for percentile comparisons

CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  score DECIMAL(3,1) NOT NULL CHECK (score >= 1.0 AND score <= 10.0),
  is_dummy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Add index for efficient percentile calculations
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score);
CREATE INDEX IF NOT EXISTS idx_scores_is_dummy ON scores(is_dummy);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);

-- Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Allow public read access for percentile calculations (dummy data is anonymous)
CREATE POLICY "Anyone can read scores for percentile calculation" ON scores
  FOR SELECT USING (true);

-- Users can insert their own scores
CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Insert 1000 dummy records with specified distribution
-- Scores 1.0-2.9: 400 records (40%)
-- Scores 3.0-4.9: 350 records (35%) 
-- Scores 5.0-6.9: 200 records (20%)
-- Scores 7.0-8.9: 40 records (4%)
-- Scores 9.0-10.0: 10 records (1%)

DO $$
DECLARE
    i INTEGER;
    random_score DECIMAL(3,1);
BEGIN
    -- Clear any existing dummy data
    DELETE FROM scores WHERE is_dummy = true;
    
    -- Generate 400 records for range 1.0-2.9 (weighted toward middle)
    FOR i IN 1..400 LOOP
        -- Use beta distribution-like weighting toward middle of range
        random_score := ROUND((
            1.0 + 
            (CASE 
                WHEN random() < 0.1 THEN random() * 0.5  -- 10% in lower quarter
                WHEN random() < 0.8 THEN 0.5 + random() * 1.0  -- 70% in middle half  
                ELSE 1.5 + random() * 0.4  -- 20% in upper quarter
            END)
        )::NUMERIC, 1);
        
        INSERT INTO scores (score, is_dummy, user_id) 
        VALUES (random_score, true, NULL);
    END LOOP;
    
    -- Generate 350 records for range 3.0-4.9
    FOR i IN 1..350 LOOP
        random_score := ROUND((
            3.0 + 
            (CASE 
                WHEN random() < 0.1 THEN random() * 0.5
                WHEN random() < 0.8 THEN 0.5 + random() * 1.0
                ELSE 1.5 + random() * 0.4
            END)
        )::NUMERIC, 1);
        
        INSERT INTO scores (score, is_dummy, user_id) 
        VALUES (random_score, true, NULL);
    END LOOP;
    
    -- Generate 200 records for range 5.0-6.9
    FOR i IN 1..200 LOOP
        random_score := ROUND((
            5.0 + 
            (CASE 
                WHEN random() < 0.1 THEN random() * 0.5
                WHEN random() < 0.8 THEN 0.5 + random() * 1.0
                ELSE 1.5 + random() * 0.4
            END)
        )::NUMERIC, 1);
        
        INSERT INTO scores (score, is_dummy, user_id) 
        VALUES (random_score, true, NULL);
    END LOOP;
    
    -- Generate 40 records for range 7.0-8.9
    FOR i IN 1..40 LOOP
        random_score := ROUND((
            7.0 + 
            (CASE 
                WHEN random() < 0.1 THEN random() * 0.5
                WHEN random() < 0.8 THEN 0.5 + random() * 1.0
                ELSE 1.5 + random() * 0.4
            END)
        )::NUMERIC, 1);
        
        INSERT INTO scores (score, is_dummy, user_id) 
        VALUES (random_score, true, NULL);
    END LOOP;
    
    -- Generate 10 records for range 9.0-10.0
    FOR i IN 1..10 LOOP
        random_score := ROUND((9.0 + random() * 1.0)::NUMERIC, 1);
        
        INSERT INTO scores (score, is_dummy, user_id) 
        VALUES (random_score, true, NULL);
    END LOOP;
    
    RAISE NOTICE 'Successfully inserted 1000 dummy score records';
END $$;