-- Drop existing table if it exists
DROP TABLE IF EXISTS team_owner_profiles CASCADE;

-- Recreate team_owner_profiles table with correct structure
CREATE TABLE IF NOT EXISTS team_owner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    sports_background TEXT,
    notable_achievements TEXT[],
    team_role TEXT,
    contact_email TEXT NOT NULL,
    phone_number TEXT,
    social_media TEXT,
    profile_image_url TEXT,
    bio TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id)
);

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_team_owner_profiles_user_id ON team_owner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_team_owner_profiles_team_id ON team_owner_profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_team_owner_profiles_names ON team_owner_profiles(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_team_owner_profiles_phone ON team_owner_profiles(phone_number);

-- Enable RLS
ALTER TABLE team_owner_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profiles and admins can view all" ON team_owner_profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles and admins can insert all" ON team_owner_profiles;
DROP POLICY IF EXISTS "Users can update their own profiles and admins can update all" ON team_owner_profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles and admins can delete all" ON team_owner_profiles;

-- Create RLS policies
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

-- Create trigger for updating updated_at
DROP TRIGGER IF EXISTS set_timestamp_team_owner_profiles ON team_owner_profiles;
CREATE TRIGGER set_timestamp_team_owner_profiles
    BEFORE UPDATE ON team_owner_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 