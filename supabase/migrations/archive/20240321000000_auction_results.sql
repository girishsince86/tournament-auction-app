-- Add tournament_id column to auction_rounds table
ALTER TABLE auction_rounds 
ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id);

-- Update existing auction rounds to have a default tournament if needed
UPDATE auction_rounds 
SET tournament_id = (SELECT id FROM tournaments LIMIT 1)
WHERE tournament_id IS NULL;

-- Make tournament_id NOT NULL after setting defaults
ALTER TABLE auction_rounds 
ALTER COLUMN tournament_id SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_auction_rounds_tournament_id ON auction_rounds(tournament_id);

-- Rollback SQL
/*
DROP INDEX IF EXISTS idx_auction_rounds_tournament_id;
ALTER TABLE auction_rounds DROP COLUMN IF EXISTS tournament_id;
*/ 