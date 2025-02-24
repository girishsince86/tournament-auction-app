-- First, drop existing functions if they exist
DROP FUNCTION IF EXISTS generate_profile_token(uuid);
DROP FUNCTION IF EXISTS validate_profile_token(text);

-- Create or replace the generate_profile_token function
CREATE OR REPLACE FUNCTION generate_profile_token(registration_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token text;
BEGIN
    -- Generate a random token using registration_id and random bytes
    token := encode(digest(registration_id::text || gen_random_bytes(16), 'sha256'), 'hex');
    
    -- Update the registration with the token and expiry (30 days from now)
    UPDATE tournament_registrations
    SET profile_token = token,
        profile_token_expires_at = NOW() + INTERVAL '30 days'
    WHERE id = registration_id;
    
    RETURN token;
END;
$$;

-- Create or replace the validate_profile_token function
CREATE OR REPLACE FUNCTION validate_profile_token(token_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    registration_id uuid;
BEGIN
    SELECT id INTO registration_id
    FROM tournament_registrations
    WHERE profile_token = token_input
    AND profile_token_expires_at > NOW();
    
    RETURN registration_id;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION generate_profile_token(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_profile_token(text) TO authenticated;

-- Verify the columns exist on tournament_registrations
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tournament_registrations' 
                  AND column_name = 'profile_token') THEN
        ALTER TABLE tournament_registrations ADD COLUMN profile_token text UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tournament_registrations' 
                  AND column_name = 'profile_token_expires_at') THEN
        ALTER TABLE tournament_registrations ADD COLUMN profile_token_expires_at timestamp with time zone;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tournament_registrations' 
                  AND column_name = 'profile_image_url') THEN
        ALTER TABLE tournament_registrations ADD COLUMN profile_image_url text;
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_profile_token 
ON tournament_registrations(profile_token);

-- Log the changes for verification
DO $$ 
BEGIN
  RAISE NOTICE 'Profile token functions and structure updated successfully';
END $$; 