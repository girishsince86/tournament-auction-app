-- Inspect existing tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name IN (
        'team_owner_profiles',
        'teams',
        'team_owners',
        'tournaments'
    )
ORDER BY 
    table_name,
    ordinal_position;

-- Inspect foreign key relationships
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN (
        'team_owner_profiles',
        'teams',
        'team_owners'
    );

-- Create or modify team_owner_profiles table if needed
CREATE TABLE IF NOT EXISTS team_owner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    sports_background TEXT,
    notable_achievements TEXT[],
    team_role TEXT,
    contact_email TEXT NOT NULL,
    social_media TEXT,
    profile_image_url TEXT,
    bio TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id)
);

-- Modify team_owner_profiles table structure
DO $$ 
BEGIN
    -- Drop columns if they exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_owner_profiles' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE team_owner_profiles DROP COLUMN full_name;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_owner_profiles' 
        AND column_name = 'contact_number'
    ) THEN
        ALTER TABLE team_owner_profiles DROP COLUMN contact_number;
    END IF;

    -- Add or modify columns
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_owner_profiles' 
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE team_owner_profiles ADD COLUMN first_name TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_owner_profiles' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE team_owner_profiles ADD COLUMN last_name TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_owner_profiles' 
        AND column_name = 'sports_background'
    ) THEN
        ALTER TABLE team_owner_profiles ADD COLUMN sports_background TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_owner_profiles' 
        AND column_name = 'notable_achievements'
    ) THEN
        ALTER TABLE team_owner_profiles ADD COLUMN notable_achievements TEXT[] NOT NULL DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_owner_profiles' 
        AND column_name = 'team_role'
    ) THEN
        ALTER TABLE team_owner_profiles ADD COLUMN team_role TEXT NOT NULL DEFAULT 'Owner';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_owner_profiles' 
        AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE team_owner_profiles ADD COLUMN contact_email TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_owner_profiles' 
        AND column_name = 'social_media'
    ) THEN
        ALTER TABLE team_owner_profiles ADD COLUMN social_media JSONB NOT NULL DEFAULT '{}';
    END IF;
END $$;

-- Create or modify teams table if needed
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL,
    tournament_id UUID NOT NULL,
    initial_budget INTEGER NOT NULL DEFAULT 0,
    remaining_budget INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_owner
        FOREIGN KEY (owner_id)
        REFERENCES team_owner_profiles(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_tournament
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON DELETE CASCADE
);

-- Modify teams table structure
DO $$ 
BEGIN
    -- Add owner_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'teams' 
        AND column_name = 'owner_name'
    ) THEN
        ALTER TABLE teams ADD COLUMN owner_name VARCHAR(255) NOT NULL DEFAULT '';
    END IF;

    -- Update default values
    ALTER TABLE teams ALTER COLUMN initial_budget SET DEFAULT 1000000000;
    ALTER TABLE teams ALTER COLUMN remaining_budget SET DEFAULT 1000000000;
    ALTER TABLE teams ALTER COLUMN max_players SET DEFAULT 12;
    ALTER TABLE teams ALTER COLUMN min_players SET DEFAULT 8;
END $$;

-- Create or modify team_owners junction table if needed
CREATE TABLE IF NOT EXISTS team_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL,
    team_id UUID NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY (auth_user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE,
    UNIQUE(auth_user_id, team_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_team_owner_profiles_user_id ON team_owner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_tournament_id ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_team_owners_auth_user_id ON team_owners(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_team_owners_team_id ON team_owners(team_id);
CREATE INDEX IF NOT EXISTS idx_team_owners_email ON team_owners(email);
CREATE INDEX IF NOT EXISTS idx_teams_owner_name ON teams(owner_name);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_teams_name_tournament 
    ON teams(tournament_id, name);
CREATE INDEX IF NOT EXISTS idx_team_owners_team_auth 
    ON team_owners(team_id, auth_user_id);

-- Drop the incorrect index if it exists
DROP INDEX IF EXISTS idx_teams_owner_id;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at
DO $$ 
BEGIN
    -- For team_owner_profiles
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'set_timestamp_team_owner_profiles'
    ) THEN
        CREATE TRIGGER set_timestamp_team_owner_profiles
        BEFORE UPDATE ON team_owner_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- For teams
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'set_timestamp_teams'
    ) THEN
        CREATE TRIGGER set_timestamp_teams
        BEFORE UPDATE ON teams
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- For team_owners
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'set_timestamp_team_owners'
    ) THEN
        CREATE TRIGGER set_timestamp_team_owners
        BEFORE UPDATE ON team_owners
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create RLS policies
ALTER TABLE team_owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_owners ENABLE ROW LEVEL SECURITY;

-- Team owner profiles policies
CREATE POLICY "Users can view their own profiles and admins can view all"
    ON team_owner_profiles
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR auth.jwt()->>'email' LIKE '%@pbel.in'
    );

CREATE POLICY "Users can insert their own profiles and admins can insert all"
    ON team_owner_profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        OR auth.jwt()->>'email' LIKE '%@pbel.in'
    );

CREATE POLICY "Users can update their own profiles and admins can update all"
    ON team_owner_profiles
    FOR UPDATE
    USING (
        auth.uid() = user_id 
        OR auth.jwt()->>'email' LIKE '%@pbel.in'
    );

CREATE POLICY "Users can delete their own profiles and admins can delete all"
    ON team_owner_profiles
    FOR DELETE
    USING (
        auth.uid() = user_id 
        OR auth.jwt()->>'email' LIKE '%@pbel.in'
    );

-- Teams policies
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

CREATE POLICY "Team owners can update their teams"
    ON teams FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM team_owners
            WHERE team_id = id
            AND auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND email LIKE '%@pbel.in'
        )
    );

-- Team owners policies
CREATE POLICY "Team ownership is viewable by everyone"
    ON team_owners FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage team ownership"
    ON team_owners FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND email LIKE '%@pbel.in'
        )
    );

-- Create function to update team name with proper validation
CREATE OR REPLACE FUNCTION update_team_name(
    p_team_id UUID,
    p_new_name TEXT,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_is_owner BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = p_user_id
        AND email LIKE '%@pbel.in'
    ) INTO v_is_admin;

    -- Check if user is team owner
    SELECT EXISTS (
        SELECT 1 FROM team_owners
        WHERE team_id = p_team_id
        AND auth_user_id = p_user_id
    ) INTO v_is_owner;

    -- Validate permissions
    IF NOT (v_is_admin OR v_is_owner) THEN
        RAISE EXCEPTION 'Unauthorized to update team name';
    END IF;

    -- Validate team exists
    IF NOT EXISTS (SELECT 1 FROM teams WHERE id = p_team_id) THEN
        RAISE EXCEPTION 'Team not found';
    END IF;

    -- Validate name format and length
    IF p_new_name !~ '^[a-zA-Z0-9\s-]{3,50}$' THEN
        RAISE EXCEPTION 'Invalid team name format. Name must be 3-50 characters and contain only letters, numbers, spaces, and hyphens.';
    END IF;

    -- Check for duplicate name in same tournament
    IF EXISTS (
        SELECT 1 
        FROM teams t1
        JOIN teams t2 ON t1.tournament_id = t2.tournament_id
        WHERE t2.id = p_team_id
        AND t1.id != p_team_id
        AND LOWER(t1.name) = LOWER(p_new_name)
    ) THEN
        RAISE EXCEPTION 'Team name already exists in this tournament';
    END IF;

    -- Update team name
    UPDATE teams
    SET 
        name = p_new_name,
        updated_at = NOW()
    WHERE id = p_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
CREATE POLICY "Team owners can update their teams"
    ON teams FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM team_owners
            WHERE team_id = id
            AND auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND email LIKE '%@pbel.in'
        )
    );

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_team_owner_profiles_names 
    ON team_owner_profiles(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_teams_name_tournament 
    ON teams(name, tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_owners_email 
    ON team_owners(email);

-- Create function to get team owner's teams
CREATE OR REPLACE FUNCTION get_owner_teams(p_user_id UUID)
RETURNS TABLE (
    team_id UUID,
    team_name VARCHAR,
    tournament_name TEXT,
    tournament_id UUID,
    initial_budget INTEGER,
    remaining_budget INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        tour.name,
        t.tournament_id,
        t.initial_budget,
        t.remaining_budget,
        t.created_at
    FROM teams t
    JOIN team_owners to_rel ON t.id = to_rel.team_id
    JOIN tournaments tour ON t.tournament_id = tour.id
    WHERE to_rel.auth_user_id = p_user_id
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for team owner images if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (
        SELECT 1
        FROM storage.buckets
        WHERE id = 'team-owner-images'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name)
        VALUES ('team-owner-images', 'team-owner-images');

        -- Enable public access for the bucket
        UPDATE storage.buckets
        SET public = true
        WHERE id = 'team-owner-images';
    END IF;
END $$;

-- Set up storage policies for team owner images
BEGIN;
    -- Allow public read access to all files
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'team-owner-images');

    -- Allow authenticated users to upload files
    CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'team-owner-images'
        AND auth.role() = 'authenticated'
    );

    -- Allow users to update their own files
    CREATE POLICY "Users can update own files"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'team-owner-images'
        AND owner = auth.uid()
    );

    -- Allow users to delete their own files
    CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'team-owner-images'
        AND owner = auth.uid()
    );
COMMIT;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Set CORS policy for the bucket
UPDATE storage.buckets
SET cors_rules = '[
    {
        "origin": "*",
        "methods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
        "headers": ["Authorization", "Content-Type", "Content-Length", "Cache-Control", "x-upsert"],
        "maxAgeSeconds": 3600
    }
]'::jsonb
WHERE id = 'team-owner-images';

-- Add foreign key reference from team_owner_profiles to teams
ALTER TABLE team_owner_profiles
    ADD CONSTRAINT fk_team_owner_profiles_team
    FOREIGN KEY (team_id)
    REFERENCES teams(id)
    ON DELETE CASCADE;

-- Add index for team_id
CREATE INDEX IF NOT EXISTS idx_team_owner_profiles_team_id ON team_owner_profiles(team_id); 