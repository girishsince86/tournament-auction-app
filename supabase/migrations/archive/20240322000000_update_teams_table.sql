-- Add tournament_id column to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id);

-- Update existing teams to have a default tournament if needed
UPDATE teams 
SET tournament_id = (SELECT id FROM tournaments LIMIT 1)
WHERE tournament_id IS NULL;

-- Make tournament_id NOT NULL after setting defaults
ALTER TABLE teams 
ALTER COLUMN tournament_id SET NOT NULL;

-- Add unique constraint for tournament_id and name
ALTER TABLE teams
ADD CONSTRAINT teams_tournament_id_name_key UNIQUE (tournament_id, name);

-- Rollback SQL
/*
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_tournament_id_name_key;
ALTER TABLE teams DROP COLUMN IF EXISTS tournament_id;
*/ 