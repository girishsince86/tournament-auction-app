-- Script to restore original profile image URLs from tournament_registrations table
-- This script will check if there are valid profile image URLs in the tournament_registrations table
-- and restore them to the players table

-- Step 1: Analyze profile image URLs in tournament_registrations table
DO $$
DECLARE
    v_valid_url_count INTEGER;
    v_null_url_count INTEGER;
    v_empty_url_count INTEGER;
    v_total_registrations INTEGER;
BEGIN
    -- Count valid URLs (not null, not empty, and containing 'supabase')
    SELECT COUNT(*) INTO v_valid_url_count 
    FROM tournament_registrations 
    WHERE profile_image_url IS NOT NULL 
    AND profile_image_url != '' 
    AND profile_image_url LIKE '%supabase%'
    AND registration_category::text LIKE 'VOLLEYBALL%';
    
    -- Count null URLs
    SELECT COUNT(*) INTO v_null_url_count 
    FROM tournament_registrations 
    WHERE profile_image_url IS NULL
    AND registration_category::text LIKE 'VOLLEYBALL%';
    
    -- Count empty URLs
    SELECT COUNT(*) INTO v_empty_url_count 
    FROM tournament_registrations 
    WHERE profile_image_url = ''
    AND registration_category::text LIKE 'VOLLEYBALL%';
    
    -- Count total volleyball registrations
    SELECT COUNT(*) INTO v_total_registrations 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%';
    
    RAISE NOTICE 'Profile image URL analysis in tournament_registrations table:';
    RAISE NOTICE '- Total volleyball registrations: %', v_total_registrations;
    RAISE NOTICE '- Valid Supabase URLs: %', v_valid_url_count;
    RAISE NOTICE '- NULL URLs: %', v_null_url_count;
    RAISE NOTICE '- Empty URLs: %', v_empty_url_count;
    
    IF v_valid_url_count = 0 THEN
        RAISE NOTICE 'WARNING: No valid Supabase URLs found in tournament_registrations table. Cannot restore original URLs.';
    ELSE
        RAISE NOTICE 'Found % valid Supabase URLs in tournament_registrations table. Will proceed with restoration.', v_valid_url_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Show sample of profile image URLs in tournament_registrations table
SELECT 
    id, 
    name, 
    registration_category::text as category,
    profile_image_url
FROM tournament_registrations
WHERE registration_category::text LIKE 'VOLLEYBALL%'
AND profile_image_url IS NOT NULL
AND profile_image_url != ''
ORDER BY name
LIMIT 10;

-- Step 3: Restore original profile image URLs from tournament_registrations to players table
DO $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Update players table with original profile image URLs from tournament_registrations
    WITH updated_players AS (
        UPDATE players p
        SET profile_image_url = tr.profile_image_url
        FROM tournament_registrations tr
        WHERE p.id = tr.id
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        AND tr.profile_image_url IS NOT NULL
        AND tr.profile_image_url != ''
        AND tr.profile_image_url LIKE '%supabase%'
        RETURNING p.id
    )
    SELECT COUNT(*) INTO v_updated_count FROM updated_players;
    
    RAISE NOTICE 'Restored original profile image URLs for % volleyball players', v_updated_count;
    
    IF v_updated_count = 0 THEN
        RAISE NOTICE 'WARNING: No profile image URLs were restored. Check if valid URLs exist in tournament_registrations table.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Check current profile image URLs in players table
DO $$
DECLARE
    v_avatar_count INTEGER;
    v_supabase_count INTEGER;
    v_total_players INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_avatar_count FROM players WHERE profile_image_url LIKE '%ui-avatars.com%';
    SELECT COUNT(*) INTO v_supabase_count FROM players WHERE profile_image_url LIKE '%supabase%';
    SELECT COUNT(*) INTO v_total_players FROM players WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = players.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    );
    
    RAISE NOTICE 'Current state of players table:';
    RAISE NOTICE '- Total volleyball players: %', v_total_players;
    RAISE NOTICE '- Players using avatar URLs: %', v_avatar_count;
    RAISE NOTICE '- Players using Supabase URLs: %', v_supabase_count;
    
    IF v_supabase_count = v_total_players THEN
        RAISE NOTICE 'SUCCESS: All volleyball players now use Supabase URLs.';
    ELSIF v_supabase_count > 0 THEN
        RAISE NOTICE 'PARTIAL SUCCESS: % volleyball players now use Supabase URLs.', v_supabase_count;
        RAISE NOTICE '% volleyball players still use avatar URLs.', v_avatar_count;
    ELSE
        RAISE NOTICE 'FAILURE: No volleyball players are using Supabase URLs.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Show sample of updated profile image URLs in players table
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

-- Instructions:
-- 1. Run this script to restore original profile image URLs from tournament_registrations table:
--    \i restore_original_profile_images.sql
--
-- 2. If no valid URLs are found in tournament_registrations table, you'll need to use one of the other scripts:
--    - update_player_profile_images_from_supabase.sql (to generate new URLs with UUIDs)
--    - update_player_profile_images_from_storage_configurable.sql (to use a naming convention)
--    - update_player_profile_images_manual_mapping.sql (to manually map player names to filenames)
--
-- 3. If only some players have valid URLs in tournament_registrations table, you can run this script first
--    to restore those URLs, then use one of the other scripts to update the remaining players. 