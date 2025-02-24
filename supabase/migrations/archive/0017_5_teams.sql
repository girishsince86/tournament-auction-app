-- Drop existing policies first
DROP POLICY IF EXISTS "Teams are viewable by authenticated users" ON teams;
DROP POLICY IF EXISTS "Teams are modifiable by authenticated users" ON teams;
DROP POLICY IF EXISTS "Teams are viewable by all authenticated users" ON teams;
DROP POLICY IF EXISTS "Teams are modifiable by admin and conductors" ON teams;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;

-- Create teams table if it doesn't exist
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    owner_id UUID NOT NULL,
    remaining_budget INTEGER NOT NULL CHECK (remaining_budget >= 0),
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, name)
);

-- Add trigger for updated_at
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teams are viewable by authenticated users"
    ON teams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teams are modifiable by authenticated users"
    ON teams FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Rollback SQL
-- DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
-- DROP TABLE IF EXISTS teams; 