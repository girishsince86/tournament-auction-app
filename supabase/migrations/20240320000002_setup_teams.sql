-- Drop team requirements tables and functions first
DROP TABLE IF EXISTS team_position_requirements CASCADE;
DROP TABLE IF EXISTS team_skill_requirements CASCADE;
DROP TABLE IF EXISTS team_combined_requirements CASCADE;
DROP FUNCTION IF EXISTS check_team_requirements() CASCADE;
DROP FUNCTION IF EXISTS check_combined_requirements() CASCADE;

-- Ensure at least one tournament exists (for fresh DBs) so team inserts have a valid tournament_id
INSERT INTO tournaments (
    name, description, start_date, end_date, registration_deadline,
    max_teams, max_players_per_team, min_players_per_team, team_points_budget, team_budget, is_active
)
SELECT
    'Default Tournament',
    'Default tournament for setup',
    CURRENT_DATE,
    CURRENT_DATE + 7,
    CURRENT_DATE + 6,
    12,
    14,
    7,
    1000000000,
    1000000000,
    true
WHERE NOT EXISTS (SELECT 1 FROM tournaments LIMIT 1);

-- First modify the teams table structure
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS min_players integer NOT NULL DEFAULT 8,
ALTER COLUMN owner_id DROP NOT NULL;

-- Drop dependent policies first
DROP POLICY IF EXISTS "Auction rounds access policy" ON auction_rounds;

-- Create team_owners table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_owners (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id uuid UNIQUE,
    email text NOT NULL UNIQUE,
    name text NOT NULL,
    team_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Enable RLS on team_owners
ALTER TABLE team_owners ENABLE ROW LEVEL SECURITY;

-- First, delete all dependent records in correct order
-- Start with auction-related tables since they reference both players and teams
DELETE FROM bids;
DELETE FROM auction_queue;
DELETE FROM auction_rounds;

-- Now delete team-related records (team_combined_requirements already dropped above)
DELETE FROM preferred_players;
DELETE FROM team_owners;
DELETE FROM teams;

-- Create teams and team owners in a single transaction
DO $$ 
BEGIN
    -- Create teams and owners
    WITH owner_data AS (
        SELECT * FROM (VALUES
            (1, 'Team Naveen', 'Naveen', 'naveen@pbel.in'),
            (2, 'Team Anish', 'Anish', 'anish@pbel.in'),
            (3, 'Team Subhamitra', 'Subhamitra', 'subhamitra@pbel.in'),
            (4, 'Team Raju', 'Raju', 'raju@pbel.in'),
            (5, 'Team Saravana', 'Saravana', 'saravana@pbel.in'),
            (6, 'Team Praveen Raj', 'Praveen Raj', 'praveenraj@pbel.in'),
            (7, 'Team Romesh', 'Romesh', 'romesh@pbel.in'),
            (8, 'Team Srinivas', 'Srinivas', 'srinivas@pbel.in'),
            (9, 'Team 9', 'TBD', NULL)
        ) AS t (sequence, name, owner_name, email)
    ), inserted_teams AS (
        INSERT INTO teams (name, owner_name, initial_budget, remaining_budget, min_players, max_players, tournament_id, owner_id)
        SELECT 
            name,
            owner_name,
            1000000000,                 -- 100 crore points initial budget
            1000000000,                 -- 100 crore points remaining budget
            8,                         -- Minimum 8 players per team
            9,                         -- Maximum 9 players per team
            (SELECT id FROM tournaments ORDER BY created_at DESC LIMIT 1), -- Latest tournament
            NULL                       -- Set owner_id to NULL since we're moving to team_owners
        FROM owner_data
        RETURNING id, name
    )
    INSERT INTO team_owners (email, name, team_id)
    SELECT 
        od.email,
        od.owner_name,
        it.id
    FROM owner_data od
    JOIN inserted_teams it ON it.name = od.name
    WHERE od.email IS NOT NULL;
END $$;

-- Drop owner_id column from teams since we're using team_owners now
ALTER TABLE teams DROP COLUMN IF EXISTS owner_id;

-- Create RLS policies for team_owners
CREATE POLICY "Team owners can view their own record"
ON team_owners
FOR SELECT
TO authenticated
USING (
    auth_user_id = auth.uid() OR 
    auth.jwt() ->> 'email' = 'gk@pbel.in'
);

CREATE POLICY "Team owners can update their own record"
ON team_owners
FOR UPDATE
TO authenticated
USING (
    auth_user_id = auth.uid() OR 
    auth.jwt() ->> 'email' = 'gk@pbel.in'
)
WITH CHECK (
    auth_user_id = auth.uid() OR 
    auth.jwt() ->> 'email' = 'gk@pbel.in'
);

-- Create RLS policies for team access
CREATE POLICY "Team owners can view their own team"
ON teams
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT team_id FROM team_owners WHERE auth_user_id = auth.uid()
    ) OR 
    auth.jwt() ->> 'email' = 'gk@pbel.in'
);

CREATE POLICY "Team owners can update their own team"
ON teams
FOR UPDATE
TO authenticated
USING (
    id IN (
        SELECT team_id FROM team_owners WHERE auth_user_id = auth.uid()
    ) OR 
    auth.jwt() ->> 'email' = 'gk@pbel.in'
)
WITH CHECK (
    id IN (
        SELECT team_id FROM team_owners WHERE auth_user_id = auth.uid()
    ) OR 
    auth.jwt() ->> 'email' = 'gk@pbel.in'
);

-- Create new auction rounds policy using team_owners
CREATE POLICY "Auction rounds access policy"
ON auction_rounds
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM team_owners 
        WHERE auth_user_id = auth.uid()
    ) OR 
    auth.jwt() ->> 'email' = 'gk@pbel.in'
);

-- Create function to link auth user to team owner
CREATE OR REPLACE FUNCTION link_auth_user_to_team_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Only try to update if email exists
    IF NEW.email IS NOT NULL THEN
        -- Update team owner if found, but don't fail if not found
        UPDATE team_owners
        SET auth_user_id = NEW.id,
            updated_at = NOW()
        WHERE email = NEW.email
        AND auth_user_id IS NULL;
    END IF;
    
    -- Always return NEW to allow user creation to proceed
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error if needed but don't fail the user creation
        RAISE WARNING 'Error in link_auth_user_to_team_owner: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link existing auth users to team owners
CREATE OR REPLACE FUNCTION link_existing_auth_users_to_team_owners()
RETURNS void AS $$
DECLARE
    v_count int;
BEGIN
    -- Log the count of unlinked team owners before update
    SELECT COUNT(*) INTO v_count FROM team_owners WHERE auth_user_id IS NULL;
    RAISE NOTICE 'Found % unlinked team owners', v_count;

    -- Log the count of auth users
    SELECT COUNT(*) INTO v_count FROM auth.users;
    RAISE NOTICE 'Found % auth users', v_count;

    -- Update team owners with matching auth users
    WITH updated_rows AS (
        UPDATE team_owners to_update
        SET auth_user_id = au.id,
            updated_at = NOW()
        FROM auth.users au
        WHERE to_update.email = au.email
        AND to_update.auth_user_id IS NULL
        RETURNING to_update.*
    )
    SELECT COUNT(*) INTO v_count FROM updated_rows;
    
    RAISE NOTICE 'Updated % team owners', v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON auth.users TO postgres;
GRANT SELECT ON auth.users TO service_role;

-- Create trigger to automatically link auth users to team owners
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION link_auth_user_to_team_owner();

-- Link existing users
SELECT link_existing_auth_users_to_team_owners();

-- Create function to update team name
CREATE OR REPLACE FUNCTION update_team_name(
    p_team_id UUID,
    p_new_name TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Check if the user has permission to update this team
    IF NOT EXISTS (
        SELECT 1 
        FROM team_owners 
        WHERE auth_user_id = auth.uid() 
        AND team_id = p_team_id
    ) AND auth.jwt() ->> 'email' != 'gk@pbel.in' THEN
        RAISE EXCEPTION 'You do not have permission to update this team name';
    END IF;

    -- Check if the new name is already taken in the tournament
    IF EXISTS (
        SELECT 1 
        FROM teams t1 
        JOIN teams t2 ON t1.tournament_id = t2.tournament_id 
        WHERE t2.id = p_team_id 
        AND t1.id != p_team_id 
        AND t1.name = p_new_name
    ) THEN
        RAISE EXCEPTION 'Team name is already taken in this tournament';
    END IF;

    -- Update the team name
    UPDATE teams 
    SET name = p_new_name,
        updated_at = NOW()
    WHERE id = p_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION update_team_name TO authenticated;
GRANT EXECUTE ON FUNCTION link_auth_user_to_team_owner TO service_role;

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create a view to verify team owner and auth user linkage
CREATE OR REPLACE VIEW team_owner_auth_status AS
SELECT 
    t.name as team_owner_name,
    t.email as team_owner_email,
    t.auth_user_id,
    t.team_id,
    teams.name as team_name,
    CASE 
        WHEN t.auth_user_id IS NULL THEN 'Not linked to auth user'
        ELSE 'Linked to auth user'
    END as auth_status
FROM team_owners t
LEFT JOIN teams ON t.team_id = teams.id;

-- Grant access to the view
GRANT SELECT ON team_owner_auth_status TO authenticated;
GRANT SELECT ON team_owner_auth_status TO service_role; 