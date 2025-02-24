-- Create tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    registration_deadline DATE NOT NULL CHECK (registration_deadline <= start_date),
    max_teams INTEGER NOT NULL CHECK (max_teams > 0),
    max_players_per_team INTEGER NOT NULL CHECK (max_players_per_team > 0),
    min_players_per_team INTEGER NOT NULL CHECK (min_players_per_team > 0 AND min_players_per_team <= max_players_per_team),
    team_points_budget INTEGER NOT NULL CHECK (team_points_budget > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

-- Add trigger for updated_at
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Tournaments are viewable by authenticated users"
    ON tournaments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Tournaments are modifiable by specific users"
    ON tournaments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Rollback SQL
-- DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
-- DROP TABLE IF EXISTS tournaments; 