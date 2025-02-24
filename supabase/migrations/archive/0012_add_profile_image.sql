-- Add profile image URL and profile token columns to tournament_registrations
ALTER TABLE tournament_registrations
ADD COLUMN profile_image_url text,
ADD COLUMN profile_token text UNIQUE,
ADD COLUMN profile_token_expires_at timestamp with time zone;

-- Create an index on profile_token for faster lookups
CREATE INDEX idx_tournament_registrations_profile_token ON tournament_registrations(profile_token);

-- Create a function to generate a unique profile token
CREATE OR REPLACE FUNCTION generate_profile_token(registration_id uuid)
RETURNS text
LANGUAGE plpgsql
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

-- Create a function to validate a profile token
CREATE OR REPLACE FUNCTION validate_profile_token(token text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    registration_id uuid;
BEGIN
    SELECT id INTO registration_id
    FROM tournament_registrations
    WHERE profile_token = token
    AND profile_token_expires_at > NOW();
    
    RETURN registration_id;
END;
$$; 