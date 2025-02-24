-- Create tournament_players table if it doesn't exist
CREATE TABLE IF NOT EXISTS tournament_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tournament_id, player_id)
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_tournament_players_tournament ON tournament_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_players_player ON tournament_players(player_id);

-- Enable RLS
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Tournament players are viewable by authenticated users"
    ON tournament_players FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Tournament players are modifiable by admin users"
    ON tournament_players FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Add updated_at trigger
CREATE TRIGGER update_tournament_players_updated_at
    BEFORE UPDATE ON tournament_players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS update_tournament_players_updated_at ON tournament_players;
DROP POLICY IF EXISTS "Tournament players are viewable by authenticated users" ON tournament_players;
DROP POLICY IF EXISTS "Tournament players are modifiable by admin users" ON tournament_players;
DROP TABLE IF EXISTS tournament_players;
*/ 