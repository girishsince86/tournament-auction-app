-- Create player tournament history table
CREATE TABLE player_tournament_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create player achievements table
CREATE TABLE player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    year INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add registration_data JSONB column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS registration_data JSONB,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add indexes
CREATE INDEX idx_player_history_player ON player_tournament_history(player_id);
CREATE INDEX idx_player_achievements_player ON player_achievements(player_id);

-- Add triggers for updated_at
CREATE TRIGGER update_player_history_updated_at
    BEFORE UPDATE ON player_tournament_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_achievements_updated_at
    BEFORE UPDATE ON player_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE player_tournament_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Player history viewable by authenticated users"
    ON player_tournament_history FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Player history modifiable by admin users"
    ON player_tournament_history FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Player achievements viewable by authenticated users"
    ON player_achievements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Player achievements modifiable by admin users"
    ON player_achievements FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS update_player_achievements_updated_at ON player_achievements;
DROP TRIGGER IF EXISTS update_player_history_updated_at ON player_tournament_history;
DROP TABLE IF EXISTS player_achievements;
DROP TABLE IF EXISTS player_tournament_history;
ALTER TABLE players DROP COLUMN IF EXISTS registration_data;
ALTER TABLE players DROP COLUMN IF EXISTS profile_image_url;
*/ 