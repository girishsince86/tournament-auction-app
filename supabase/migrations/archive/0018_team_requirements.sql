-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_team_position_requirements_updated_at ON team_position_requirements;
DROP TRIGGER IF EXISTS update_team_skill_requirements_updated_at ON team_skill_requirements;
DROP TRIGGER IF EXISTS validate_team_requirements ON players;

-- Drop existing functions
DROP FUNCTION IF EXISTS check_team_requirements();

-- Drop existing tables
DROP TABLE IF EXISTS team_position_requirements;
DROP TABLE IF EXISTS team_skill_requirements;

-- Create team position requirements table
CREATE TABLE team_position_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id),
    position player_position NOT NULL,
    min_players INTEGER NOT NULL DEFAULT 1 CHECK (min_players >= 0),
    max_players INTEGER NOT NULL CHECK (max_players >= min_players),
    current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
    points_allocated INTEGER NOT NULL DEFAULT 0 CHECK (points_allocated >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, position)
);

-- Create team skill requirements table
CREATE TABLE team_skill_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id),
    skill_level skill_level NOT NULL,
    min_players INTEGER NOT NULL DEFAULT 0 CHECK (min_players >= 0),
    max_players INTEGER NOT NULL CHECK (max_players >= min_players),
    current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
    points_allocated INTEGER NOT NULL DEFAULT 0 CHECK (points_allocated >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, skill_level)
);

-- Add triggers
CREATE TRIGGER update_team_position_requirements_updated_at
    BEFORE UPDATE ON team_position_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_skill_requirements_updated_at
    BEFORE UPDATE ON team_skill_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for critical team requirement tables
ALTER TABLE team_position_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_skill_requirements ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "Team position requirements are viewable by authenticated users"
    ON team_position_requirements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team position requirements are modifiable by authenticated users"
    ON team_position_requirements FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Team skill requirements are viewable by authenticated users"
    ON team_skill_requirements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team skill requirements are modifiable by authenticated users"
    ON team_skill_requirements FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add functions for requirement validation
CREATE OR REPLACE FUNCTION check_team_requirements()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if allocation would exceed position limit
    IF EXISTS (
        SELECT 1 FROM team_position_requirements tpr
        WHERE tpr.team_id = NEW.current_team_id
        AND tpr.position = NEW.player_position
        AND tpr.current_count >= tpr.max_players
    ) THEN
        RAISE EXCEPTION 'Position limit exceeded for team';
    END IF;

    -- Check if allocation would exceed skill level limit
    IF EXISTS (
        SELECT 1 FROM team_skill_requirements tsr
        WHERE tsr.team_id = NEW.current_team_id
        AND tsr.skill_level = NEW.skill_level
        AND tsr.current_count >= tsr.max_players
    ) THEN
        RAISE EXCEPTION 'Skill level limit exceeded for team';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to players table for requirement validation
CREATE TRIGGER validate_team_requirements
    BEFORE UPDATE OF current_team_id ON players
    FOR EACH ROW
    WHEN (NEW.current_team_id IS NOT NULL)
    EXECUTE FUNCTION check_team_requirements();

-- Rollback SQL
-- DROP TRIGGER IF EXISTS validate_team_requirements ON players;
-- DROP FUNCTION IF EXISTS check_team_requirements();
-- DROP TRIGGER IF EXISTS update_team_position_requirements_updated_at ON team_position_requirements;
-- DROP TRIGGER IF EXISTS update_team_skill_requirements_updated_at ON team_skill_requirements;
-- DROP TABLE IF EXISTS team_skill_requirements;
-- DROP TABLE IF EXISTS team_position_requirements; 