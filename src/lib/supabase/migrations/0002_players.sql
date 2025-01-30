-- Create players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    player_position player_position NOT NULL,
    base_price INTEGER NOT NULL,
    current_team_id UUID,
    image_url TEXT,
    status player_status NOT NULL DEFAULT 'AVAILABLE',
    phone_number TEXT NOT NULL,
    apartment_number TEXT NOT NULL,
    jersey_number TEXT,
    tshirt_size tshirt_size NOT NULL,
    skill_level skill_level NOT NULL,
    height INTEGER,
    experience INTEGER,
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create player statistics table
CREATE TABLE player_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    matches_played INTEGER DEFAULT 0,
    points_scored INTEGER DEFAULT 0,
    serves_total INTEGER DEFAULT 0,
    serves_successful INTEGER DEFAULT 0,
    blocks_total INTEGER DEFAULT 0,
    blocks_successful INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, tournament_id)
);

-- Add triggers
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_statistics_updated_at
    BEFORE UPDATE ON player_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Players are viewable by all authenticated users"
    ON players FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Players are updatable by admin and conductors"
    ON players FOR UPDATE
    USING (auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR'));

CREATE POLICY "Player statistics are viewable by all authenticated users"
    ON player_statistics FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Player statistics are updatable by admin and conductors"
    ON player_statistics FOR UPDATE
    USING (auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR')); 