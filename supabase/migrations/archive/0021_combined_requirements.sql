-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_team_position_requirements_updated_at ON team_position_requirements;
DROP TRIGGER IF EXISTS update_team_skill_requirements_updated_at ON team_skill_requirements;
DROP TRIGGER IF EXISTS validate_team_requirements ON players;

-- Drop existing functions
DROP FUNCTION IF EXISTS check_team_requirements();

-- Create new combined requirements table
CREATE TABLE team_combined_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id),
    position player_position NOT NULL,
    skill_level skill_level NOT NULL,
    min_players INTEGER NOT NULL DEFAULT 0 CHECK (min_players >= 0),
    max_players INTEGER NOT NULL CHECK (max_players >= min_players),
    current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
    points_allocated INTEGER NOT NULL DEFAULT 0 CHECK (points_allocated >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, position, skill_level)
);

-- Migrate existing data
INSERT INTO team_combined_requirements (
    team_id,
    position,
    skill_level,
    min_players,
    max_players,
    current_count,
    points_allocated
)
SELECT 
    pr.team_id,
    pr.position,
    sr.skill_level,
    GREATEST(pr.min_players, sr.min_players),
    LEAST(pr.max_players, sr.max_players),
    LEAST(pr.current_count, sr.current_count),
    pr.points_allocated + sr.points_allocated
FROM team_position_requirements pr
CROSS JOIN team_skill_requirements sr
WHERE pr.team_id = sr.team_id;

-- Add trigger for updated_at
CREATE TRIGGER update_team_combined_requirements_updated_at
    BEFORE UPDATE ON team_combined_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add function for requirement validation
CREATE OR REPLACE FUNCTION check_combined_requirements()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if allocation would exceed combined limit
    IF EXISTS (
        SELECT 1 FROM team_combined_requirements tcr
        WHERE tcr.team_id = NEW.current_team_id
        AND tcr.position = NEW.player_position
        AND tcr.skill_level = NEW.skill_level
        AND tcr.current_count >= tcr.max_players
    ) THEN
        RAISE EXCEPTION 'Combined position and skill level limit exceeded for team';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to players table for requirement validation
CREATE TRIGGER validate_combined_requirements
    BEFORE UPDATE OF current_team_id ON players
    FOR EACH ROW
    WHEN (NEW.current_team_id IS NOT NULL)
    EXECUTE FUNCTION check_combined_requirements();

-- Enable RLS
ALTER TABLE team_combined_requirements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Team combined requirements are viewable by authenticated users"
    ON team_combined_requirements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team combined requirements are modifiable by authenticated users"
    ON team_combined_requirements FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Drop old tables
DROP TABLE team_position_requirements CASCADE;
DROP TABLE team_skill_requirements CASCADE;

-- Rollback SQL
-- DROP TABLE IF EXISTS team_combined_requirements CASCADE;
-- DROP FUNCTION IF EXISTS check_combined_requirements(); 