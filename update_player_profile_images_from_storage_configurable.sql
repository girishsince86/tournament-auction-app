-- Script to update profile image URLs for volleyball players using Supabase storage
-- This script will update the profile_image_url field for players to use Supabase storage URLs
-- You can configure the storage URL and bucket name to match your Supabase setup

-- Configuration variables
\set storage_base_url 'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public'
\set bucket_name 'player-images'
\set file_extension 'jpg'

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
    v_storage_url TEXT;
    v_bucket_name TEXT;
    v_file_extension TEXT;
BEGIN
    -- Get configuration variables
    v_storage_url := :'storage_base_url';
    v_bucket_name := :'bucket_name';
    v_file_extension := :'file_extension';
    
    RAISE NOTICE 'Using storage URL: %/%/', v_storage_url, v_bucket_name;
    
    -- Update players to use Supabase storage URLs based on player names
    WITH updated_players AS (
        UPDATE players p
        SET profile_image_url = 
            -- Format: https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/player-images/[player_name].jpg
            -- Replace spaces with underscores and convert to lowercase for the filename
            v_storage_url || '/' || v_bucket_name || '/' || LOWER(REPLACE(p.name, ' ', '_')) || '.' || v_file_extension
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
    v_bucket_name TEXT;
BEGIN
    v_bucket_name := :'bucket_name';
    
    SELECT COUNT(*) INTO v_avatar_count FROM players WHERE profile_image_url LIKE '%ui-avatars.com%';
    SELECT COUNT(*) INTO v_storage_count FROM players WHERE profile_image_url LIKE '%/' || v_bucket_name || '/%';
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

-- Instructions:
-- 1. Before running this script, update the configuration variables at the top:
--    - storage_base_url: Your Supabase storage URL (e.g., 'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public')
--    - bucket_name: The name of your storage bucket (e.g., 'player-images')
--    - file_extension: The file extension of your images (e.g., 'jpg', 'png')
--
-- 2. Run the script with:
--    \i update_player_profile_images_from_storage_configurable.sql
--
-- 3. If you need to customize the filename format, modify the SQL in Step 2 where it constructs the URL. 