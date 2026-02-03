-- Script to update profile image URLs for volleyball players using Supabase storage
-- This script will update the profile_image_url field for players to use Supabase storage URLs

-- Step 1: Check current profile image URLs
DO $$
DECLARE
    v_avatar_count INTEGER;
    v_total_players INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_avatar_count FROM players WHERE profile_image_url LIKE '%ui-avatars.com%';
    SELECT COUNT(*) INTO v_total_players FROM players WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = players.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    );
    
    RAISE NOTICE 'Current state:';
    RAISE NOTICE '- Total volleyball players: %', v_total_players;
    RAISE NOTICE '- Players using avatar URLs: %', v_avatar_count;
    
    IF v_avatar_count = v_total_players THEN
        RAISE NOTICE 'All volleyball players are using avatar URLs. This script will update them to use Supabase storage URLs.';
    ELSIF v_avatar_count > 0 THEN
        RAISE NOTICE 'Some volleyball players are using avatar URLs. This script will update them to use Supabase storage URLs.';
    ELSE
        RAISE NOTICE 'No volleyball players are using avatar URLs. No update needed.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Update profile image URLs for volleyball players to use Supabase storage
DO $$
DECLARE
    v_updated_count INTEGER;
    v_storage_url TEXT := 'https://supabase.co/storage/v1/object/public/player-images/';
BEGIN
    -- Update players to use Supabase storage URLs based on player names
    WITH updated_players AS (
        UPDATE players p
        SET profile_image_url = 
            -- Format: https://supabase.co/storage/v1/object/public/player-images/[player_name].jpg
            -- Replace spaces with underscores and convert to lowercase for the filename
            v_storage_url || LOWER(REPLACE(p.name, ' ', '_')) || '.jpg'
        WHERE EXISTS (
            SELECT 1 FROM tournament_registrations tr 
            WHERE tr.id = p.id 
            AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        )
        AND p.profile_image_url LIKE '%ui-avatars.com%'
        RETURNING p.id
    )
    SELECT COUNT(*) INTO v_updated_count FROM updated_players;
    
    RAISE NOTICE 'Updated profile image URLs for % volleyball players to use Supabase storage', v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Check updated profile image URLs
DO $$
DECLARE
    v_avatar_count INTEGER;
    v_storage_count INTEGER;
    v_total_players INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_avatar_count FROM players WHERE profile_image_url LIKE '%ui-avatars.com%';
    SELECT COUNT(*) INTO v_storage_count FROM players WHERE profile_image_url LIKE '%supabase.co/storage%';
    SELECT COUNT(*) INTO v_total_players FROM players WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = players.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    );
    
    RAISE NOTICE 'Updated state:';
    RAISE NOTICE '- Total volleyball players: %', v_total_players;
    RAISE NOTICE '- Players using avatar URLs: %', v_avatar_count;
    RAISE NOTICE '- Players using Supabase storage URLs: %', v_storage_count;
    
    IF v_avatar_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All volleyball players now use Supabase storage URLs.';
    ELSE
        RAISE NOTICE 'WARNING: Some volleyball players are still using avatar URLs.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Show sample of updated profile image URLs
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
ORDER BY p.name
LIMIT 10;

-- Note: If the Supabase storage URL is different from the one used in this script,
-- you can modify the v_storage_url variable in Step 2 to match your actual storage URL.
-- The current URL assumes a structure like: https://supabase.co/storage/v1/object/public/player-images/
-- with image filenames based on player names (lowercase with underscores instead of spaces). 