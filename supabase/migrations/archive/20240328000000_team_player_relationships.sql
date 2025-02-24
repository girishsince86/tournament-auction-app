-- Add foreign key for current_team_id in players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS current_team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_players_current_team ON players(current_team_id);

-- Add foreign key for winning_team_id in auction_rounds table
ALTER TABLE auction_rounds
ADD CONSTRAINT auction_rounds_winning_team_id_fkey 
FOREIGN KEY (winning_team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_auction_rounds_winning_team ON auction_rounds(winning_team_id);

-- Rollback SQL
/*
DROP INDEX IF EXISTS idx_auction_rounds_winning_team;
ALTER TABLE auction_rounds DROP CONSTRAINT IF EXISTS auction_rounds_winning_team_id_fkey;
DROP INDEX IF EXISTS idx_players_current_team;
ALTER TABLE players DROP COLUMN IF EXISTS current_team_id;
*/ 