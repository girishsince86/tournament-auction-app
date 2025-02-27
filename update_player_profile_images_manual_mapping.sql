-- Script to update profile image URLs for volleyball players using manual mapping
-- This script allows you to manually map player names to specific image filenames in Supabase storage

-- Configuration variables
\set storage_base_url 'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public'
\set bucket_name 'player-images'
\set file_extension 'jpg'

-- Step 1: Create a temporary table for manual mapping
CREATE TEMP TABLE player_image_mapping (
    player_name TEXT PRIMARY KEY,
    image_filename TEXT NOT NULL
);

-- Step 2: Insert manual mappings
-- Add your mappings here in the format: INSERT INTO player_image_mapping VALUES ('Player Name', 'filename');
-- Examples:
INSERT INTO player_image_mapping VALUES ('Taraka Kajuluti', 'taraka_kajuluti');
-- INSERT INTO player_image_mapping VALUES ('Another Player', 'custom_filename');
-- INSERT INTO player_image_mapping VALUES ('Yet Another Player', 'yet_another_custom_filename');

-- For players without manual mappings, we'll use the default naming convention (lowercase name with underscores)

-- Step 3: Update profile image URLs for volleyball players using the manual mappings
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
    
    -- Update players with manual mappings
    WITH updated_players AS (
        UPDATE players p
        SET profile_image_url = 
            v_storage_url || '/' || v_bucket_name || '/' || m.image_filename || '.' || v_file_extension
        FROM player_image_mapping m
        WHERE p.name = m.player_name
        AND EXISTS (
            SELECT 1 FROM tournament_registrations tr 
            WHERE tr.id = p.id 
            AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        )
        RETURNING p.id
    )
    SELECT COUNT(*) INTO v_updated_count FROM updated_players;
    
    RAISE NOTICE 'Updated profile image URLs for % volleyball players using manual mappings', v_updated_count;
    
    -- Update remaining players using the default naming convention
    WITH remaining_players AS (
        UPDATE players p
        SET profile_image_url = 
            v_storage_url || '/' || v_bucket_name || '/' || LOWER(REPLACE(p.name, ' ', '_')) || '.' || v_file_extension
        WHERE NOT EXISTS (
            SELECT 1 FROM player_image_mapping m WHERE p.name = m.player_name
        )
        AND EXISTS (
            SELECT 1 FROM tournament_registrations tr 
            WHERE tr.id = p.id 
            AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        )
        AND p.profile_image_url LIKE '%ui-avatars.com%'
        RETURNING p.id
    )
    SELECT COUNT(*) INTO v_updated_count FROM remaining_players;
    
    RAISE NOTICE 'Updated profile image URLs for % additional volleyball players using default naming convention', v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Check updated profile image URLs
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

-- Step 5: Show sample of updated profile image URLs
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

-- Step 6: Clean up the temporary table
DROP TABLE player_image_mapping;

-- Instructions:
-- 1. Before running this script, update the configuration variables at the top:
--    - storage_base_url: Your Supabase storage URL (e.g., 'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public')
--    - bucket_name: The name of your storage bucket (e.g., 'player-images')
--    - file_extension: The file extension of your images (e.g., 'jpg', 'png')
--
-- 2. Add manual mappings for players whose image filenames don't follow the default naming convention
--    - The default naming convention is: lowercase name with spaces replaced by underscores
--    - For example, "John Doe" would map to "john_doe.jpg"
--    - If a player's image has a different filename, add a mapping in Step 2
--
-- 3. Run the script with:
--    \i update_player_profile_images_manual_mapping.sql 