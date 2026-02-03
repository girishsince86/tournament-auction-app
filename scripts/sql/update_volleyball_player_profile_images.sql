-- Script to update profile image URLs using the provided list of image filenames
-- This script directly uses the list of image filenames to update the profile image URLs

-- Configuration variables - PLEASE UPDATE THESE BEFORE RUNNING
\set storage_base_url 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public'
\set bucket_name 'tournament-media/profile-images'

-- Step 1: Create and populate a regular table (not temporary)
-- Drop the table if it exists to avoid conflicts
DROP TABLE IF EXISTS known_image_files;

-- Create a regular table to store the known image filenames
CREATE TABLE known_image_files (
    filename TEXT PRIMARY KEY
);

-- Insert the known image filenames (all actual files)
INSERT INTO known_image_files (filename) VALUES
('ef987c3a-88a1-42ab-898f-c7e83750bcdf-1740478235193.jpg'),
('eecf6a27-2ec6-450f-a336-11f3f06770f3-1740480690036.jpg'),
('eddd5a64-335c-49f9-a737-103370693c2d-1740492208988.jpg'),
('edc6b83e-065c-4f5a-8cc6-7b6aad2e5296-1740476387997.jpg'),
('e92a3849-8485-4311-8abb-5260e4e26b92-1740511426269.jpg'),
('e68d0f4d-acc7-4195-89fd-89f28dfc6eca-1740406315004.jpg'),
('e4687aef-b1a8-4bba-9ba4-319a2972d29a-1740447056362.jpg'),
('e45ec321-fd3d-4e75-a3f7-da3ed3381b83-1740588489600.jpg'),
('dfae4a5c-8101-445b-95a4-97a33801d26a-1740418011304.jpg'),
('deea3e3d-95ed-4ab1-853c-ec5dc08fea22-1740509065254.jpg'),
('de16dd6b-0883-4841-8e4e-5974e65a5af4-1740399956189.jpg'),
('ddb0d705-2b34-41f5-9097-051e1451f733-1740399821677.jpg'),
('d5f04750-3bba-4ba2-b2ff-241405204b3e-1740499991933.jpg'),
('d30a936a-d203-447a-a7a0-e4066c5f5dbf-1740484427800.jpg'),
('d0f9b11b-2861-42a9-94ca-c152f6b73ffd-1740402876498.jpg'),
('ce26102a-1ef9-426d-b761-a17271ceda1c-1740582818141.jpg'),
('cd67c689-d215-4499-9166-cedef0fb8acb-1740444961283.jpg'),
('cbe963f4-3d23-4804-82af-249c6fce4504-1740406755183.jpg'),
('bdaa2414-ab71-4211-9717-8e1182a19453-1740479380803.jpg'),
('bdaa2414-ab71-4211-9717-8e1182a19453-1740479280523.jpg'),
('ba641b17-6ab5-484a-a0a2-617aff62a7ec-1740401336301.jpg'),
('b90a03f7-3e2b-4d59-b9ea-29a79ca043a5-1740643965352.jpg'),
('b8bdfdd1-fda1-4d37-ae63-bb5f2784fbda-1740458637811.jpg'),
('b24a27d1-0f12-4260-85aa-13d961675064-1740448741637.jpg'),
('b0c1b936-1f64-479a-b066-a366f724c6df-1740500120072.jpg'),
('ab16e9c0-fd01-4c94-a873-8b27e88f5726-1740581674716.jpg'),
('aade184c-0996-4ad7-8bab-f8519317e9c1-1740478004383.jpg'),
('a974aebc-43ed-4724-9594-9580d6403976-1740479297368.jpg'),
('a7f88e26-1e4e-4072-8618-9002c836d58a-1740587138364.jpg'),
('a728fd7c-c76a-40eb-9c25-0b6168fcb5e7-1740533820997.jpg'),
('a669a136-be57-4be1-bd02-24e65fc0148f-1740401804559.jpg'),
('a5e35469-06d9-4495-ab62-34f8c12940aa-1740417309387.jpg'),
('a59ca042-796c-43f3-98b2-df66ec625dd1-1740454089032.jpg'),
('9e761804-ec6f-47dc-8711-78ebd3646d5a-1740417597058.jpg'),
('9e58b279-d553-4899-a5fa-65480f4a3401-1740419811960.jpg'),
('9d1872c1-fe0a-48f9-9a78-b40a5eb225bb-1740492906342.jpg'),
('9ba7adfc-ba1d-40df-ba1a-b740ef23ff1d-1740449495240.jpg'),
('9520da9a-3b9f-4e8c-9700-7b5aeaf7da36-1740478137468.jpg'),
('8d14edac-e18c-4d15-b725-5b338f48294b-1740505979319.jpg'),
('8b6dc59b-1538-4da8-8c07-4c075c7b4b0b-1740477825776.jpg'),
('848b49cd-fabe-41c2-ab89-3b8680041483-1740628490888.jpg'),
('7ee59b06-0f14-4458-ab9d-7fa985e94230-1740478645287.jpg'),
('7da62481-42a9-4e91-9e37-acc437d9031f-1740452625158.jpg'),
('7b0650a6-3e3b-4a79-b79f-5d96dcb3e461-1740478986219.jpg'),
('78a399c9-a648-448d-9dbe-9e2425fb1ac9-1740499870377.jpg'),
('76b6093f-7485-43f4-88a5-3df98d063b66-1740457449158.jpg'),
('6d2d7de1-e539-4f25-9e4d-bbffaf702119-1740581927052.jpg'),
('69b9b9f0-6050-4615-ba38-fd8eca9f4134-1740492258736.jpg'),
('690a772c-c146-41a1-a225-ab00eceee6ab-1740485872641.jpg'),
('61abc1e5-63e1-4e82-9fe3-74b34623001c-1740493388171.jpg'),
('5d2af801-234f-4fd2-857e-d54d25c4e1e6-1740401402658.jpg'),
('5a31831c-f07c-4a17-8a7e-96c1a9091ab8-1740402456067.jpg'),
('5606c7e2-0089-45f3-8830-4437c158a990-1740460623586.jpg'),
('53e67c7e-54a8-4657-8288-2797e7b7f278-1740462295402.jpg'),
('51562ac8-7eaf-4b10-84cc-6c5125b1fd4b-1740478011088.jpg'),
('4eb10c79-d929-405c-bb71-15dd2da4ecb7-1740555527629.jpg'),
('4dc59467-9be4-435d-9854-694e17f17f3a-1740402666079.jpg'),
('4d80a9ab-a6be-4c9b-a102-dfd9e757a5e8-1740404262877.jpg'),
('441565fc-8b70-4a90-bf0e-6ba6fecf3b5a-1740478172571.jpg'),
('3f6e07e2-7123-448b-a3d1-e6d0e77c3f9c-1740417077847.jpg'),
('39b4fb34-74d9-4556-af2e-21a7188bfd02-1740478411374.jpg'),
('38bf3c12-dd80-43df-b065-5dc1dd2dade9-1740402020819.jpg'),
('33f96886-0d1d-4529-95e0-86b98ad8c0ab-1740488080124.jpg'),
('30d1f2b7-155a-48e5-970f-b437d2c4057e-1740490644256.jpg'),
('2eb08455-be42-4ff6-bb6a-7f6ce8c2a372-1740416210292.jpg'),
('279c3a5c-d34c-49ec-9606-b6ba0fb373f4-1740477836350.jpg'),
('25d4cb8a-d1ee-40ea-ac5a-1bf69b2c8075-1740454274358.jpg'),
('1cabfc68-e919-4d7f-b50d-4e588d0efd62-1740581532622.jpg'),
('111ae69a-c2f4-44b5-85a8-7cbe3ba2bbc6-1740492717685.jpg'),
('0a6783a0-e742-4c02-9914-b32ad7e851d4-1740479749111.jpg'),
('07e5921c-bf25-4803-9599-98134c6e0db2-1740403006999.jpg'),
('05d7e772-40e5-4a8e-b1cf-13b5204bd2ee-1740479998882.jpg'),
('04e63685-30a6-4169-bc40-e85686b41af2-1740481684042.jpg'),
('03289d83-83ff-4026-8d0c-97e9c470f88b-1740491405693.jpg');

-- Step 2: Check current profile image URLs
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

-- Step 3: Assign image files to players
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
        AND (p.profile_image_url IS NULL OR p.profile_image_url LIKE '%ui-avatars.com%')
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
    AND (p.profile_image_url IS NULL OR p.profile_image_url LIKE '%ui-avatars.com%');
    
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

-- Step 4: Check updated profile image URLs
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

-- Clean up - drop the table when done
DROP TABLE IF EXISTS known_image_files;

-- Instructions:
-- 1. Before running this script, update the configuration variables at the top if needed:
--    - storage_base_url: Your Supabase storage URL (already set based on the example)
--    - bucket_name: The path to your profile images bucket (already set based on the example)
--
-- 2. Run the script with:
--    \i update_volleyball_player_profile_images.sql
--
-- 3. This script will:
--    - Create a regular table with the known image filenames
--    - Assign these images to volleyball players who are currently using avatar URLs or have no profile image
--    - Update both the players and tournament_registrations tables
--    - Clean up by dropping the temporary table when done
--
-- 4. The script handles the case where there might be duplicate filenames in the list
--    by using the PRIMARY KEY constraint on the table.
--
-- 5. If there are not enough image files for all players, the script will update as many as possible
--    and leave the rest with avatar URLs. 