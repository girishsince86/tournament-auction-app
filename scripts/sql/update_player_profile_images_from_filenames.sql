-- Script to update profile image URLs using a list of known image filenames
-- This script directly uses the list of image filenames to update the profile image URLs

-- Configuration variables - PLEASE UPDATE THESE BEFORE RUNNING
\set storage_base_url 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public'
\set bucket_name 'tournament-media/profile-images'

-- Step 1: Create a temporary table to store the known image filenames
CREATE TEMP TABLE known_image_files (
    filename TEXT PRIMARY KEY
);

-- Step 2: Insert the known image filenames (all actual files)
INSERT INTO known_image_files (filename) VALUES
('03289d83-83ff-4026-8d0c-97e9c470f88b-1740491405693.jpg'),
('04e63685-30a6-4169-bc40-e85686b41af2-1740481684042.jpg'),
('05d7e772-40e5-4a8e-b1cf-13b5204bd2ee-1740479998882.jpg'),
('07e5921c-bf25-4803-9599-98134c6e0db2-1740403006999.jpg'),
('0a6783a0-e742-4c02-9914-b32ad7e851d4-1740479749111.jpg'),
('111ae69a-c2f4-44b5-85a8-7cbe3ba2bbc6-1740492717685.jpg'),
('1cabfc68-e919-4d7f-b50d-4e588d0efd62-1740581532622.jpg'),
('25d4cb8a-d1ee-40ea-ac5a-1bf69b2c8075-1740454274358.jpg'),
('279c3a5c-d34c-49ec-9606-b6ba0fb373f4-1740477836350.jpg'),
('2eb08455-be42-4ff6-bb6a-7f6ce8c2a372-1740416210292.jpg'),
('30d1f2b7-155a-48e5-970f-b437d2c4057e-1740490644256.jpg'),
('33f96886-0d1d-4529-95e0-86b98ad8c0ab-1740488080124.jpg'),
('38bf3c12-dd80-43df-b065-5dc1dd2dade9-1740402020819.jpg'),
('39b4fb34-74d9-4556-af2e-21a7188bfd02-1740478411374.jpg'),
('3f6e07e2-7123-448b-a3d1-e6d0e77c3f9c-1740417077847.jpg'),
('441565fc-8b70-4a90-bf0e-6ba6fecf3b5a-1740478172571.jpg'),
('4d80a9ab-a6be-4c9b-a102-dfd9e757a5e8-1740404262877.jpg'),
('4dc59467-9be4-435d-9854-694e17f17f3a-1740402666079.jpg'),
('4eb10c79-d929-405c-bb71-15dd2da4ecb7-1740555527629.jpg');

-- Step 3: Check current profile image URLs
DO $$
DECLARE
    v_avatar_count INTEGER;
    v_total_players INTEGER;
    v_image_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_avatar_count FROM players WHERE profile_image_url LIKE '%ui-avatars.com%';
    SELECT COUNT(*) INTO v_total_players FROM players WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = players.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    );
    SELECT COUNT(*) INTO v_image_count FROM known_image_files;
    
    RAISE NOTICE 'Current state:';
    RAISE NOTICE '- Total volleyball players: %', v_total_players;
    RAISE NOTICE '- Players using avatar URLs: %', v_avatar_count;
    RAISE NOTICE '- Known image files: %', v_image_count;
    
    IF v_avatar_count = 0 THEN
        RAISE NOTICE 'No players are using avatar URLs. No fix needed.';
    ELSE
        RAISE NOTICE 'Found % players using avatar URLs. Will proceed with fixes.', v_avatar_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Assign image files to players
DO $$
DECLARE
    v_storage_url TEXT;
    v_bucket_name TEXT;
    v_player_count INTEGER;
    v_image_count INTEGER;
    v_assigned_count INTEGER := 0;
    v_player_cursor CURSOR FOR 
        SELECT p.id, p.name 
        FROM players p
        WHERE EXISTS (
            SELECT 1 FROM tournament_registrations tr 
            WHERE tr.id = p.id 
            AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        )
        AND p.profile_image_url LIKE '%ui-avatars.com%'
        ORDER BY p.name;
    v_player_id UUID;
    v_player_name TEXT;
    v_image_filename TEXT;
BEGIN
    -- Get configuration variables
    v_storage_url := :'storage_base_url';
    v_bucket_name := :'bucket_name';
    
    -- Count players and images
    SELECT COUNT(*) INTO v_player_count 
    FROM players p
    WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = p.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    )
    AND p.profile_image_url LIKE '%ui-avatars.com%';
    
    SELECT COUNT(*) INTO v_image_count FROM known_image_files;
    
    RAISE NOTICE 'Assigning % image files to % players', v_image_count, v_player_count;
    
    -- Check if we have enough images
    IF v_image_count < v_player_count THEN
        RAISE NOTICE 'WARNING: Not enough image files for all players. Some players will not be updated.';
    END IF;
    
    -- Assign images to players
    OPEN v_player_cursor;
    LOOP
        FETCH v_player_cursor INTO v_player_id, v_player_name;
        EXIT WHEN NOT FOUND OR v_assigned_count >= v_image_count;
        
        -- Get the next image filename
        SELECT filename INTO v_image_filename 
        FROM known_image_files 
        OFFSET v_assigned_count 
        LIMIT 1;
        
        -- Update the player's profile_image_url
        UPDATE players 
        SET profile_image_url = v_storage_url || '/' || v_bucket_name || '/' || v_image_filename
        WHERE id = v_player_id;
        
        -- Update the tournament_registrations table as well
        UPDATE tournament_registrations 
        SET profile_image_url = v_storage_url || '/' || v_bucket_name || '/' || v_image_filename
        WHERE id = v_player_id;
        
        RAISE NOTICE 'Assigned image % to player: %', v_image_filename, v_player_name;
        
        v_assigned_count := v_assigned_count + 1;
    END LOOP;
    CLOSE v_player_cursor;
    
    RAISE NOTICE 'Assigned % images to players', v_assigned_count;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Check updated profile image URLs
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
    
    RAISE NOTICE '';
    RAISE NOTICE 'Updated state:';
    RAISE NOTICE '- Total volleyball players: %', v_total_players;
    RAISE NOTICE '- Players using avatar URLs: %', v_avatar_count;
    RAISE NOTICE '- Players using Supabase URLs: %', v_supabase_count;
    
    IF v_avatar_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All volleyball players now use Supabase URLs.';
    ELSE
        RAISE NOTICE 'WARNING: % volleyball players are still using avatar URLs.', v_avatar_count;
        RAISE NOTICE 'This is likely because there were not enough image files for all players.';
        RAISE NOTICE 'You can run the comprehensive_profile_image_fix.sql script to generate URLs for the remaining players.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Show sample of updated profile image URLs
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

-- Clean up
DROP TABLE IF EXISTS known_image_files;

-- Instructions:
-- 1. Before running this script, update the configuration variables at the top:
--    - storage_base_url: Your Supabase storage URL (already set based on the example)
--    - bucket_name: The path to your profile images bucket (already set based on the example)
--
-- 2. Run the script with:
--    \i update_player_profile_images_from_filenames.sql
--
-- 3. This script will:
--    - Create a temporary table with the known image filenames
--    - Assign these images to volleyball players who are currently using avatar URLs
--    - Update both the players and tournament_registrations tables
--
-- 4. If you have more image files to add, you can modify the INSERT statement in Step 2.
--
-- 5. If there are not enough image files for all players, the script will update as many as possible
--    and leave the rest with avatar URLs. You can run the comprehensive_profile_image_fix.sql script
--    to generate URLs for the remaining players. 