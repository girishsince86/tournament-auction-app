-- Add sport_category to teams, players, auction_queue, and auction_rounds
-- to support multiple sport auctions within the same tournament.
-- Defaults to 'VOLLEYBALL_OPEN_MEN' so all existing data is automatically categorized.

-- Add missing skill_level enum values used by registrations
ALTER TYPE skill_level ADD VALUE IF NOT EXISTS 'INTERMEDIATE_B';
ALTER TYPE skill_level ADD VALUE IF NOT EXISTS 'UPPER_INTERMEDIATE_BB';
ALTER TYPE skill_level ADD VALUE IF NOT EXISTS 'RECREATIONAL_C';

ALTER TABLE teams ADD COLUMN IF NOT EXISTS sport_category TEXT NOT NULL DEFAULT 'VOLLEYBALL_OPEN_MEN';
ALTER TABLE players ADD COLUMN IF NOT EXISTS sport_category TEXT NOT NULL DEFAULT 'VOLLEYBALL_OPEN_MEN';
ALTER TABLE auction_queue ADD COLUMN IF NOT EXISTS sport_category TEXT NOT NULL DEFAULT 'VOLLEYBALL_OPEN_MEN';
ALTER TABLE auction_rounds ADD COLUMN IF NOT EXISTS sport_category TEXT NOT NULL DEFAULT 'VOLLEYBALL_OPEN_MEN';

-- Index for filtering by sport_category (used in all auction queries)
CREATE INDEX IF NOT EXISTS idx_teams_sport_category ON teams(tournament_id, sport_category);
CREATE INDEX IF NOT EXISTS idx_players_sport_category ON players(tournament_id, sport_category);
CREATE INDEX IF NOT EXISTS idx_auction_queue_sport_category ON auction_queue(tournament_id, sport_category);
CREATE INDEX IF NOT EXISTS idx_auction_rounds_sport_category ON auction_rounds(tournament_id, sport_category);
