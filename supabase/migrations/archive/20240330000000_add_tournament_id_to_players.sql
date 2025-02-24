-- Add tournament_id column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id);

-- Update existing players to have a default tournament if needed
UPDATE players 
SET tournament_id = (SELECT id FROM tournaments LIMIT 1)
WHERE tournament_id IS NULL;

-- Make tournament_id NOT NULL after setting defaults
ALTER TABLE players 
ALTER COLUMN tournament_id SET NOT NULL;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_players_tournament ON players(tournament_id);

-- Add foreign key constraint
ALTER TABLE players
ADD CONSTRAINT players_tournament_id_fkey 
FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;

-- Rollback SQL
/*
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_tournament_id_fkey;
DROP INDEX IF EXISTS idx_players_tournament;
ALTER TABLE players DROP COLUMN IF EXISTS tournament_id;
*/ 