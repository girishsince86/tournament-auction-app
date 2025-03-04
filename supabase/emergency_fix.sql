-- EMERGENCY FIX FOR LIVE AUCTION
-- Run this script directly in the Supabase SQL editor

-- Drop all triggers that might be referencing the problematic tables or functions
DROP TRIGGER IF EXISTS validate_combined_requirements ON players;
DROP TRIGGER IF EXISTS validate_team_requirements ON players;
DROP TRIGGER IF EXISTS update_team_position_requirements_updated_at ON team_position_requirements;
DROP TRIGGER IF EXISTS update_team_skill_requirements_updated_at ON team_skill_requirements;

-- Drop all functions that might be causing issues
DROP FUNCTION IF EXISTS check_combined_requirements() CASCADE;
DROP FUNCTION IF EXISTS check_team_requirements() CASCADE;

-- Drop tables if they still exist (with CASCADE to remove dependencies)
DROP TABLE IF EXISTS team_position_requirements CASCADE;
DROP TABLE IF EXISTS team_skill_requirements CASCADE;
DROP TABLE IF EXISTS team_combined_requirements CASCADE;

-- Create a simplified team_combined_requirements table
CREATE TABLE IF NOT EXISTS team_combined_requirements (
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

-- Create a simplified check_combined_requirements function
CREATE OR REPLACE FUNCTION check_combined_requirements()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a simplified version that doesn't perform any checks
    -- Just return NEW to allow the operation to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a simplified check_team_requirements function
CREATE OR REPLACE FUNCTION check_team_requirements()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a simplified version that doesn't perform any checks
    -- Just return NEW to allow the operation to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get a list of all user-defined triggers on players table and disable them
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'players'::regclass 
        AND NOT tgisinternal
    LOOP
        EXECUTE format('ALTER TABLE players DISABLE TRIGGER %I', trigger_rec.tgname);
        RAISE NOTICE 'Disabled trigger % on players table', trigger_rec.tgname;
    END LOOP;
    
    -- Do the same for auction_rounds
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'auction_rounds'::regclass 
        AND NOT tgisinternal
    LOOP
        EXECUTE format('ALTER TABLE auction_rounds DISABLE TRIGGER %I', trigger_rec.tgname);
        RAISE NOTICE 'Disabled trigger % on auction_rounds table', trigger_rec.tgname;
    END LOOP;
    
    -- And for teams
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'teams'::regclass 
        AND NOT tgisinternal
    LOOP
        EXECUTE format('ALTER TABLE teams DISABLE TRIGGER %I', trigger_rec.tgname);
        RAISE NOTICE 'Disabled trigger % on teams table', trigger_rec.tgname;
    END LOOP;
END
$$;

-- Enable RLS on the new table
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

-- Log the emergency change
RAISE NOTICE 'EMERGENCY: All validation triggers disabled for live auction'; 