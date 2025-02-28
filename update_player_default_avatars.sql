-- Script to set default UI avatars with initials for players without profile images
-- This script uses the ui-avatars.com service to generate avatars based on player names

-- Begin transaction
BEGIN;

-- First, identify players without profile images
DO $$
DECLARE
    v_missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_missing_count
    FROM players p
    WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = p.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    )
    AND (p.profile_image_url IS NULL OR p.profile_image_url = '');
    
    RAISE NOTICE 'Found % volleyball players without profile images', v_missing_count;
END;
$$ LANGUAGE plpgsql;

-- Update players table with UI avatars
UPDATE players p
SET profile_image_url = 'https://ui-avatars.com/api/?name=' || REPLACE(p.name, ' ', '+') || '&size=256&background=random&color=ffffff&bold=true'
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = p.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
AND (p.profile_image_url IS NULL OR p.profile_image_url = '');

-- Update tournament_registrations table with the same UI avatars
UPDATE tournament_registrations tr
SET profile_image_url = 'https://ui-avatars.com/api/?name=' || 
    REPLACE(COALESCE(tr.first_name, '') || ' ' || COALESCE(tr.last_name, ''), ' ', '+') || 
    '&size=256&background=random&color=ffffff&bold=true'
WHERE tr.registration_category::text LIKE 'VOLLEYBALL%'
AND (tr.profile_image_url IS NULL OR tr.profile_image_url = '');

-- Verify the updates
DO $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_updated_count
    FROM players p
    WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = p.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    )
    AND p.profile_image_url LIKE 'https://ui-avatars.com/api/%';
    
    RAISE NOTICE 'Updated % volleyball players with UI avatars', v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Show sample of updated profile image URLs
SELECT 
    p.id, 
    p.name, 
    p.profile_image_url
FROM players p
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = p.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
AND p.profile_image_url LIKE 'https://ui-avatars.com/api/%'
ORDER BY p.name
LIMIT 10;

-- Commit the transaction
COMMIT;

-- Instructions:
-- 1. Run this script with:
--    \i update_player_default_avatars.sql
--
-- 2. This script will:
--    - Identify volleyball players without profile images
--    - Update them with UI avatars based on their names
--    - Update both the players and tournament_registrations tables
--    - Show a sample of the updated profile image URLs
--
-- 3. The UI avatars are generated using the ui-avatars.com service with these parameters:
--    - name: The player's name with spaces replaced by '+'
--    - size: 256 pixels
--    - background: Random color
--    - color: White text (ffffff)
--    - bold: True for better visibility
--
-- 4. You can customize the avatar appearance by modifying the URL parameters:
--    - Change background color: &background=0D8ABC
--    - Change text color: &color=ffffff
--    - Change size: &size=128
--    - Add rounded corners: &rounded=true
--    - See more options at: https://ui-avatars.com/ 