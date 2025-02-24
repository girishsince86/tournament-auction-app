-- Create a function to copy profile_image_url from tournament_registrations to players
CREATE OR REPLACE FUNCTION copy_profile_image_url()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the player's profile_image_url if it exists in tournament_registrations
    UPDATE players
    SET profile_image_url = tr.profile_image_url
    FROM tournament_registrations tr
    WHERE tr.id = NEW.id
    AND tr.profile_image_url IS NOT NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to copy profile_image_url when a player is created
CREATE TRIGGER copy_profile_image_url_trigger
    AFTER INSERT ON players
    FOR EACH ROW
    EXECUTE FUNCTION copy_profile_image_url();

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS copy_profile_image_url_trigger ON players;
DROP FUNCTION IF EXISTS copy_profile_image_url();
*/ 