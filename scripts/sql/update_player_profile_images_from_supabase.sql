-- Script to update profile image URLs for volleyball players using the correct Supabase storage URL format
-- This script will update the profile_image_url field for players to use the actual Supabase storage URLs

-- Configuration variables - PLEASE UPDATE THESE BEFORE RUNNING
\set storage_base_url 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public'
\set bucket_name 'tournament-media/profile-images'

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
BEGIN
    -- Get configuration variables
    v_storage_url := :'storage_base_url';
    v_bucket_name := :'bucket_name';
    
    RAISE NOTICE 'Using storage URL: %/%', v_storage_url, v_bucket_name;
    
    -- Update players to use Supabase storage URLs with UUIDs
    WITH updated_players AS (
        UPDATE players p
        SET profile_image_url = 
            -- Format: https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/[UUID]-[timestamp].jpg
            -- Generate a UUID and timestamp for each player
            v_storage_url || '/' || v_bucket_name || '/' || 
            REPLACE(uuid_generate_v4()::text, '-', '') || '-' || 
            EXTRACT(EPOCH FROM NOW())::bigint || '.jpg'
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
    RAISE NOTICE 'NOTE: These URLs are placeholders. You will need to upload actual images to these locations in Supabase storage.';
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
    SELECT COUNT(*) INTO v_storage_count FROM players WHERE profile_image_url LIKE '%' || REPLACE(v_bucket_name, '/', '%') || '%';
    SELECT COUNT(*) INTO v_total_players FROM players WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = p.id 
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
-- 1. Make sure the uuid-ossp extension is enabled in your database:
--    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- 2. Before running this script, verify the configuration variables at the top:
--    - storage_base_url: Your Supabase storage URL (already set to the correct value based on the example)
--    - bucket_name: The path to your profile images bucket (already set based on the example)
--
-- 3. Run the script with:
--    \i update_player_profile_images_from_supabase.sql
--
-- 4. IMPORTANT: After running this script, you will need to upload actual images to these locations in Supabase storage.
--    The script generates placeholder URLs with UUIDs and timestamps, but the actual images need to be uploaded separately.
--
-- 5. If you want to use existing images in Supabase storage instead of generating new URLs, you'll need to modify this script
--    to map player names to specific image filenames or use a different approach. 