-- Create teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    initial_budget INTEGER NOT NULL,
    remaining_budget INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, tournament_id)
);

-- Create team statistics table
CREATE TABLE team_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    points_scored INTEGER DEFAULT 0,
    points_conceded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, tournament_id)
);

-- Add foreign key to players table
ALTER TABLE players
ADD CONSTRAINT fk_players_team
FOREIGN KEY (current_team_id)
REFERENCES teams(id)
ON DELETE SET NULL;

-- Add triggers
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_statistics_updated_at
    BEFORE UPDATE ON team_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teams are viewable by all authenticated users"
    ON teams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teams are updatable by owner"
    ON teams FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Teams are updatable by admin and conductors"
    ON teams FOR UPDATE
    USING (auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR'));

CREATE POLICY "Team statistics are viewable by all authenticated users"
    ON team_statistics FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team statistics are updatable by admin and conductors"
    ON team_statistics FOR UPDATE
    USING (auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR')); 