-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    module_id VARCHAR(10) UNIQUE NOT NULL, -- Format: M001, M002, etc.
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS (Row Level Security) policy for modules table
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to modules (needed for admin dashboard)
CREATE POLICY "Allow anonymous read access on modules" 
ON modules FOR SELECT 
USING (true);

-- Allow service role full access to modules
CREATE POLICY "Allow service role full access on modules" 
ON modules FOR ALL 
USING (true);

-- Add module_id column to existing lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS module_id VARCHAR(10);

-- Add foreign key constraint (optional, but recommended)
-- Note: This will be added after modules are populated
-- ALTER TABLE lessons 
-- ADD CONSTRAINT fk_lessons_module_id 
-- FOREIGN KEY (module_id) REFERENCES modules(module_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_module_id ON modules(module_id);

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_modules_updated_at 
    BEFORE UPDATE ON modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();