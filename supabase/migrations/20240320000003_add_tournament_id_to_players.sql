-- Add tournament_id column to players table (required for load_players_from_registrations and app)
ALTER TABLE players
ADD COLUMN IF NOT EXISTS tournament_id uuid REFERENCES tournaments(id);

CREATE INDEX IF NOT EXISTS idx_players_tournament ON players(tournament_id);
