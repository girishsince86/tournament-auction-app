-- Add owner_id column to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Update existing teams to have a default owner if needed
-- You may want to set this to an admin user's ID
UPDATE teams 
SET owner_id = (SELECT id FROM auth.users LIMIT 1)
WHERE owner_id IS NULL;

-- Make owner_id NOT NULL after setting defaults
ALTER TABLE teams 
ALTER COLUMN owner_id SET NOT NULL;

-- Rollback SQL
/*
ALTER TABLE teams DROP COLUMN IF EXISTS owner_id;
*/ 