-- Script to update profile image URLs using the provided list of image filenames
-- This script directly uses the list of image filenames to update the profile image URLs

-- Configuration variables - PLEASE UPDATE THESE BEFORE RUNNING
\set storage_base_url 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public'
\set bucket_name 'tournament-media/profile-images'

-- Step 1: Create and populate a regular table (not temporary)
-- Drop the tables if they exist
DROP TABLE IF EXISTS known_image_files;
DROP TABLE IF EXISTS player_image_mapping;
    
-- Create a regular table to store the known image filenames
CREATE TABLE known_image_files (
    filename TEXT PRIMARY KEY,
    extracted_uuid TEXT, -- Store the extracted UUID from the filename
    timestamp_value BIGINT, -- Store the timestamp from the filename
    assigned BOOLEAN DEFAULT FALSE -- Track whether this image has been assigned
);

-- Create a table to map players to specific images
CREATE TABLE player_image_mapping (
    player_id UUID PRIMARY KEY,
    image_filename TEXT REFERENCES known_image_files(filename),
    mapping_type TEXT -- Track how this mapping was created (uuid_match, fallback, manual)
);
    
-- Insert the known image filenames
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

-- Step 2: Extract UUIDs and timestamps from filenames
DO $$
DECLARE
    v_duplicate_count INTEGER;
BEGIN
    -- Update the known_image_files table to extract the UUID part from each filename
    UPDATE known_image_files
    SET extracted_uuid = SUBSTRING(filename FROM '^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})');
    
    -- Extract the timestamp part from each filename
    UPDATE known_image_files
    SET timestamp_value = (SUBSTRING(filename FROM '-([0-9]+)\.jpg$'))::BIGINT;
    
    -- Log the extraction results
    RAISE NOTICE 'Extracted UUIDs from % filenames', (SELECT COUNT(*) FROM known_image_files WHERE extracted_uuid IS NOT NULL);
    RAISE NOTICE 'Extracted timestamps from % filenames', (SELECT COUNT(*) FROM known_image_files WHERE timestamp_value IS NOT NULL);
    
    -- Show a sample of extracted UUIDs and timestamps for verification
    RAISE NOTICE 'Sample of extracted UUIDs and timestamps:';
    PERFORM filename, extracted_uuid, timestamp_value 
    FROM known_image_files 
    WHERE extracted_uuid IS NOT NULL AND timestamp_value IS NOT NULL 
    LIMIT 5;
    
    -- Check for duplicate UUIDs in the filenames
    SELECT COUNT(*) INTO v_duplicate_count
    FROM (
        SELECT extracted_uuid
        FROM known_image_files 
        GROUP BY extracted_uuid 
        HAVING COUNT(*) > 1
    ) AS duplicates;
    
    RAISE NOTICE 'Found % UUIDs with multiple image files', v_duplicate_count;
    
    -- If there are duplicates, log them
    IF v_duplicate_count > 0 THEN
        RAISE NOTICE 'Duplicate UUIDs (showing only the latest file for each):';
        
        -- This is a separate SELECT statement outside the PL/pgSQL block
        -- It will be executed and its results displayed to the user
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Show duplicate UUIDs (if any) - this is outside the PL/pgSQL block
WITH duplicates AS (
    SELECT extracted_uuid, COUNT(*) as count
    FROM known_image_files 
    GROUP BY extracted_uuid 
    HAVING COUNT(*) > 1
),
latest_files AS (
    SELECT kif.extracted_uuid, kif.filename, kif.timestamp_value,
           ROW_NUMBER() OVER (PARTITION BY kif.extracted_uuid ORDER BY kif.timestamp_value DESC) as rn
    FROM known_image_files kif
    JOIN duplicates d ON kif.extracted_uuid = d.extracted_uuid
)
SELECT extracted_uuid, filename, timestamp_value
FROM latest_files 
WHERE rn = 1 
ORDER BY extracted_uuid;

-- Step 3: Check current profile image URLs
DO $$
DECLARE
    v_avatar_count INTEGER;
    v_supabase_count INTEGER;
    v_total_players INTEGER;
    v_uuid_match_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_avatar_count FROM players WHERE profile_image_url LIKE '%ui-avatars.com%';
    SELECT COUNT(*) INTO v_supabase_count FROM players WHERE profile_image_url LIKE '%supabase%';
    SELECT COUNT(*) INTO v_total_players FROM players WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = players.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    );
    
    -- Check how many players have IDs that match the extracted UUIDs
    SELECT COUNT(*) INTO v_uuid_match_count 
    FROM players p
    JOIN known_image_files kif ON p.id::text = kif.extracted_uuid
    WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = p.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    );
    
    RAISE NOTICE 'Current state:';
    RAISE NOTICE '- Total volleyball players: %', v_total_players;
    RAISE NOTICE '- Players using avatar URLs: %', v_avatar_count;
    RAISE NOTICE '- Players using Supabase URLs: %', v_supabase_count;
    RAISE NOTICE '- Known image files: %', (SELECT COUNT(*) FROM known_image_files);
    RAISE NOTICE '- Players with UUID matches in filenames: %', v_uuid_match_count;
    
    -- Show a sample of players with UUID matches
    RAISE NOTICE 'Sample of players with UUID matches:';
    PERFORM p.id, p.name, kif.filename, kif.timestamp_value
    FROM players p
    JOIN known_image_files kif ON p.id::text = kif.extracted_uuid
    WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = p.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    )
    ORDER BY kif.timestamp_value DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create player-to-image mappings based on UUID matching
DO $$
DECLARE
    v_match_count INTEGER := 0;
    v_fallback_count INTEGER := 0;
    v_player_cursor CURSOR FOR 
        SELECT p.id, p.name 
        FROM players p
        WHERE EXISTS (
            SELECT 1 FROM tournament_registrations tr 
            WHERE tr.id = p.id 
            AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        )
        AND NOT EXISTS (SELECT 1 FROM player_image_mapping WHERE player_id = p.id)
        ORDER BY p.name;
    v_player_id UUID;
    v_player_name TEXT;
    v_image_cursor CURSOR FOR
        SELECT filename 
        FROM known_image_files 
        WHERE NOT assigned
        AND NOT EXISTS (SELECT 1 FROM player_image_mapping WHERE image_filename = filename)
        ORDER BY filename;
    v_image_filename TEXT;
    v_player_found BOOLEAN;
    v_image_found BOOLEAN;
BEGIN
    -- IMPORTANT: Clear all existing mappings to force reassignment
    DELETE FROM player_image_mapping;
    
    -- Reset the assigned flag on all images
    UPDATE known_image_files SET assigned = FALSE;
    
    -- First, try to match players with images based on UUID
    -- Use a WITH clause to handle duplicate UUIDs by selecting only the latest image for each player
    -- (based on the timestamp in the filename)
    WITH ranked_images AS (
        SELECT 
            p.id AS player_id, 
            kif.filename,
            ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY kif.timestamp_value DESC) AS rn
        FROM players p
        JOIN known_image_files kif ON p.id::text = kif.extracted_uuid
        WHERE EXISTS (
            SELECT 1 FROM tournament_registrations tr 
            WHERE tr.id = p.id 
            AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        )
    )
    INSERT INTO player_image_mapping (player_id, image_filename, mapping_type)
    SELECT player_id, filename, 'uuid_match'
    FROM ranked_images
    WHERE rn = 1;
    
    GET DIAGNOSTICS v_match_count = ROW_COUNT;
    RAISE NOTICE 'Created % player-to-image mappings based on UUID matching', v_match_count;
    
    -- Mark these images as assigned
    UPDATE known_image_files kif
    SET assigned = TRUE
    FROM player_image_mapping pim
    WHERE kif.filename = pim.image_filename
    AND pim.mapping_type = 'uuid_match';
    
    -- Show the UUID matches for verification
    RAISE NOTICE 'UUID matches (using latest images):';
    PERFORM p.id, p.name, pim.image_filename, kif.timestamp_value
    FROM player_image_mapping pim
    JOIN players p ON pim.player_id = p.id
    JOIN known_image_files kif ON pim.image_filename = kif.filename
    WHERE pim.mapping_type = 'uuid_match'
    ORDER BY kif.timestamp_value DESC
    LIMIT 10;
    
    -- For players without a UUID match, assign remaining images
    OPEN v_player_cursor;
    OPEN v_image_cursor;
    
    -- Improved loop logic to handle cases where one cursor reaches the end before the other
    LOOP
        -- Fetch the next player
        FETCH v_player_cursor INTO v_player_id, v_player_name;
        v_player_found := FOUND;
        
        -- If no more players, exit the loop
        EXIT WHEN NOT v_player_found;
        
        -- Fetch the next image
        FETCH v_image_cursor INTO v_image_filename;
        v_image_found := FOUND;
        
        -- If no more images, exit the loop
        EXIT WHEN NOT v_image_found;
        
        -- Insert the mapping only if both player and image were found
        INSERT INTO player_image_mapping (player_id, image_filename, mapping_type)
        VALUES (v_player_id, v_image_filename, 'fallback');
        
        -- Mark this image as assigned
        UPDATE known_image_files SET assigned = TRUE WHERE filename = v_image_filename;
        
        RAISE NOTICE 'Created fallback mapping: Player % -> Image %', v_player_name, v_image_filename;
        v_fallback_count := v_fallback_count + 1;
    END LOOP;
    
    CLOSE v_player_cursor;
    CLOSE v_image_cursor;
    
    RAISE NOTICE 'Created % fallback player-to-image mappings', v_fallback_count;
    RAISE NOTICE 'Total mappings created: %', (v_match_count + v_fallback_count);
    
    -- IMPORTANT: If you need specific players to have specific images,
    -- you can add manual mappings here. For example:
    -- 
    -- UPDATE player_image_mapping 
    -- SET image_filename = 'specific-image-filename.jpg', mapping_type = 'manual'
    -- WHERE player_id = 'specific-player-uuid';
    
    -- Fix the 7 mismatched players by creating manual mappings
    RAISE NOTICE 'Creating manual mappings for players with mismatched UUIDs...';
    
    -- First, insert the new filenames into known_image_files
    RAISE NOTICE 'Ensuring manual mapping image files exist in the known_image_files table...';
    
    -- Insert the files if they don't exist (with ON CONFLICT DO NOTHING to avoid errors)
    INSERT INTO known_image_files (filename, extracted_uuid, timestamp_value, assigned)
    VALUES 
        ('fa09bdaf-d4a6-48c6-86a9-9078c420e80f-1740479280523.jpg', 'fa09bdaf-d4a6-48c6-86a9-9078c420e80f', 1740479280523, TRUE),
        ('f565d332-9cac-4cff-9ceb-a45457213c35-1740406755183.jpg', 'f565d332-9cac-4cff-9ceb-a45457213c35', 1740406755183, TRUE),
        ('84a0618e-8da1-4f0a-a7ed-0a58b75e56c7-1740643965352.jpg', '84a0618e-8da1-4f0a-a7ed-0a58b75e56c7', 1740643965352, TRUE),
        ('b798ce9d-d55d-4cec-aa38-31ce46fe5a64-1740533820997.jpg', 'b798ce9d-d55d-4cec-aa38-31ce46fe5a64', 1740533820997, TRUE),
        ('fbcb18bf-8636-465f-99d7-d330c7d03505-1740492906342.jpg', 'fbcb18bf-8636-465f-99d7-d330c7d03505', 1740492906342, TRUE),
        ('837f011f-178d-4262-81aa-6bd88583fb0a-1740452625158.jpg', '837f011f-178d-4262-81aa-6bd88583fb0a', 1740452625158, TRUE),
        ('f38be24c-f139-48f4-903b-a926fb3971d9-1740404262877.jpg', 'f38be24c-f139-48f4-903b-a926fb3971d9', 1740404262877, TRUE)
    ON CONFLICT (filename) DO NOTHING;
    
    -- Now update the player_image_mapping table with the new filenames
    -- 1. Abhijith Awale
    UPDATE player_image_mapping 
    SET image_filename = 'fa09bdaf-d4a6-48c6-86a9-9078c420e80f-1740479280523.jpg', mapping_type = 'manual'
    WHERE player_id = 'fa09bdaf-d4a6-48c6-86a9-9078c420e80f';
    
    -- 2. Devaraju Mandapati
    UPDATE player_image_mapping 
    SET image_filename = 'f565d332-9cac-4cff-9ceb-a45457213c35-1740406755183.jpg', mapping_type = 'manual'
    WHERE player_id = 'f565d332-9cac-4cff-9ceb-a45457213c35';
    
    -- 3. Hemant Deka
    UPDATE player_image_mapping 
    SET image_filename = '84a0618e-8da1-4f0a-a7ed-0a58b75e56c7-1740643965352.jpg', mapping_type = 'manual'
    WHERE player_id = '84a0618e-8da1-4f0a-a7ed-0a58b75e56c7';
    
    -- 4. Kishore Babu
    UPDATE player_image_mapping 
    SET image_filename = 'b798ce9d-d55d-4cec-aa38-31ce46fe5a64-1740533820997.jpg', mapping_type = 'manual'
    WHERE player_id = 'b798ce9d-d55d-4cec-aa38-31ce46fe5a64';
    
    -- 5. Mulpuri Krishnapriya
    UPDATE player_image_mapping 
    SET image_filename = 'fbcb18bf-8636-465f-99d7-d330c7d03505-1740492906342.jpg', mapping_type = 'manual'
    WHERE player_id = 'fbcb18bf-8636-465f-99d7-d330c7d03505';
    
    -- 6. RAJ KIRAN SINGH
    UPDATE player_image_mapping 
    SET image_filename = '837f011f-178d-4262-81aa-6bd88583fb0a-1740452625158.jpg', mapping_type = 'manual'
    WHERE player_id = '837f011f-178d-4262-81aa-6bd88583fb0a';
    
    -- 7. Servejeet Singh
    UPDATE player_image_mapping 
    SET image_filename = 'f38be24c-f139-48f4-903b-a926fb3971d9-1740404262877.jpg', mapping_type = 'manual'
    WHERE player_id = 'f38be24c-f139-48f4-903b-a926fb3971d9';
    
    RAISE NOTICE 'Manual mappings created for 7 players with mismatched UUIDs.';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Assign image files to players based on the mapping
DO $$
DECLARE
    v_storage_url TEXT := 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public';
    v_bucket_name TEXT := 'tournament-media/profile-images';
    v_assigned_count INTEGER := 0;
    v_mapping_cursor CURSOR FOR 
        SELECT m.player_id, p.name, m.image_filename, m.mapping_type, kif.timestamp_value
        FROM player_image_mapping m
        JOIN players p ON m.player_id = p.id
        JOIN known_image_files kif ON m.image_filename = kif.filename
        ORDER BY p.name;
    v_player_id UUID;
    v_player_name TEXT;
    v_image_filename TEXT;
    v_mapping_type TEXT;
    v_timestamp_value BIGINT;
    v_old_url TEXT;
    v_new_url TEXT;
BEGIN
    -- Assign images to players based on the mapping
    OPEN v_mapping_cursor;
    LOOP
        FETCH v_mapping_cursor INTO v_player_id, v_player_name, v_image_filename, v_mapping_type, v_timestamp_value;
        EXIT WHEN NOT FOUND;
        
        -- Get the old URL for logging
        SELECT profile_image_url INTO v_old_url FROM players WHERE id = v_player_id;
        
        -- Construct the new URL
        v_new_url := v_storage_url || '/' || v_bucket_name || '/' || v_image_filename;
        
        -- Update the player's profile_image_url
        UPDATE players 
        SET profile_image_url = v_new_url
        WHERE id = v_player_id;
        
        -- Update the tournament_registrations table as well
        UPDATE tournament_registrations 
        SET profile_image_url = v_new_url
        WHERE id = v_player_id;
        
        RAISE NOTICE 'Player: % | Old URL: % | New URL: % | Mapping: % | Timestamp: %', 
            v_player_name, 
            SUBSTRING(v_old_url FROM 1 FOR 50) || '...',
            SUBSTRING(v_new_url FROM 1 FOR 50) || '...',
            v_mapping_type,
            v_timestamp_value;
        
        v_assigned_count := v_assigned_count + 1;
    END LOOP;
    CLOSE v_mapping_cursor;
    
    RAISE NOTICE 'Assigned % images to players based on mappings', v_assigned_count;
    
    -- Force a commit to ensure changes are persisted
    COMMIT;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Check updated profile image URLs
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

-- Step 7: Show sample of updated profile image URLs
SELECT 
    p.id, 
    p.name, 
    p.profile_image_url,
    (SELECT mapping_type FROM player_image_mapping WHERE player_id = p.id) AS mapping_type,
    (SELECT kif.timestamp_value 
     FROM player_image_mapping pim 
     JOIN known_image_files kif ON pim.image_filename = kif.filename 
     WHERE pim.player_id = p.id) AS timestamp_value
FROM players p
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = p.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
ORDER BY p.name
LIMIT 20;

-- Step 8: Show all mappings for verification
SELECT 
    p.id, 
    p.name, 
    pim.image_filename,
    pim.mapping_type,
    kif.timestamp_value,
    p.profile_image_url
FROM player_image_mapping pim
JOIN players p ON pim.player_id = p.id
JOIN known_image_files kif ON pim.image_filename = kif.filename
ORDER BY pim.mapping_type, kif.timestamp_value DESC
LIMIT 50;

-- Step 9: Check alignment between player UUIDs and image filenames
SELECT 
    p.id AS player_id,
    p.name AS player_name,
    SUBSTRING(p.profile_image_url FROM '([^/]+)$') AS image_filename,
    SUBSTRING(p.profile_image_url FROM '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})') AS extracted_uuid_from_url,
    CASE 
        WHEN p.id::text = SUBSTRING(p.profile_image_url FROM '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})') THEN 'ALIGNED'
        ELSE 'MISMATCHED'
    END AS alignment_status,
    (SELECT mapping_type FROM player_image_mapping WHERE player_id = p.id) AS mapping_type
FROM players p
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = p.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
AND p.profile_image_url LIKE '%supabase%'
ORDER BY 
    CASE 
        WHEN p.id::text = SUBSTRING(p.profile_image_url FROM '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})') THEN 0
        ELSE 1
    END,
    p.name;

-- Step 9 (Simplified): Show only mismatches between player UUIDs and image filenames
SELECT 
    p.id AS player_uuid,
    p.name AS player_name,
    p.profile_image_url AS image_url
FROM players p
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = p.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
AND p.profile_image_url LIKE '%supabase%'
AND p.id::text != SUBSTRING(p.profile_image_url FROM '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})')
ORDER BY p.name;

-- Step 10: Summary of alignment status
SELECT 
    CASE 
        WHEN p.id::text = SUBSTRING(p.profile_image_url FROM '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})') THEN 'ALIGNED'
        ELSE 'MISMATCHED'
    END AS alignment_status,
    COUNT(*) AS count,
    (SELECT mapping_type FROM player_image_mapping WHERE player_id = p.id) AS mapping_type
FROM players p
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = p.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
AND p.profile_image_url LIKE '%supabase%'
GROUP BY 
    CASE 
        WHEN p.id::text = SUBSTRING(p.profile_image_url FROM '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})') THEN 'ALIGNED'
        ELSE 'MISMATCHED'
    END,
    (SELECT mapping_type FROM player_image_mapping WHERE player_id = p.id)
ORDER BY alignment_status;

-- Clean up - drop the tables when done
DROP TABLE IF EXISTS player_image_mapping;
DROP TABLE IF EXISTS known_image_files;

-- Instructions:
-- 1. Before running this script, update the configuration variables at the top if needed:
--    - storage_base_url: Your Supabase storage URL (already set based on the example)
--    - bucket_name: The path to your profile images bucket (already set based on the example)
--
-- 2. This script will:
--    - Extract UUIDs and timestamps from image filenames
--    - Try to match these UUIDs with player IDs, using the latest image when duplicates exist
--    - For players without a UUID match, assign remaining images
--    - Update both the players and tournament_registrations tables
--    - Clean up by dropping the tables when done
--
-- 3. If you need specific players to have specific images, modify the player-to-image mapping
--    section in Step 4. You can add manual mappings for specific players.
--
-- 4. Run the script with:
--    \i update_volleyball_player_profile_images_fixed.sql
--
-- 5. If there are not enough image files for all players, the script will update as many as possible
--    and leave the rest with avatar URLs. 