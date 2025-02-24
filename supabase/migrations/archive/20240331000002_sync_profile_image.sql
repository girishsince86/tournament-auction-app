-- Create a function to sync profile_image_url from tournament_registrations to players
CREATE OR REPLACE FUNCTION sync_profile_image_from_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if profile_image_url has changed
    IF OLD.profile_image_url IS DISTINCT FROM NEW.profile_image_url THEN
        -- Update the player's profile_image_url
        UPDATE players
        SET profile_image_url = NEW.profile_image_url
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to sync profile_image_url from players to tournament_registrations
CREATE OR REPLACE FUNCTION sync_profile_image_from_player()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if profile_image_url has changed
    IF OLD.profile_image_url IS DISTINCT FROM NEW.profile_image_url THEN
        -- Update the registration's profile_image_url
        UPDATE tournament_registrations
        SET profile_image_url = NEW.profile_image_url
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to sync profile_image_url
CREATE TRIGGER sync_profile_image_from_registration_trigger
    AFTER UPDATE ON tournament_registrations
    FOR EACH ROW
    EXECUTE FUNCTION sync_profile_image_from_registration();

CREATE TRIGGER sync_profile_image_from_player_trigger
    AFTER UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION sync_profile_image_from_player();

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS sync_profile_image_from_registration_trigger ON tournament_registrations;
DROP TRIGGER IF EXISTS sync_profile_image_from_player_trigger ON players;
DROP FUNCTION IF EXISTS sync_profile_image_from_registration();
DROP FUNCTION IF EXISTS sync_profile_image_from_player();
*/ 