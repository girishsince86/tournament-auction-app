-- Comprehensive script to fix profile image URLs for volleyball players
-- This script tries multiple approaches in sequence to ensure the best possible results

-- Make sure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configuration variables - PLEASE UPDATE THESE BEFORE RUNNING
\set storage_base_url 'https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public'
\set bucket_name 'tournament-media/profile-images'
\set file_extension 'jpg'

-- Step 1: Analyze current state
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
    
    RAISE NOTICE '=== INITIAL STATE ===';
    RAISE NOTICE 'Total volleyball players: %', v_total_players;
    RAISE NOTICE 'Players using avatar URLs: %', v_avatar_count;
    RAISE NOTICE 'Players using Supabase URLs: %', v_supabase_count;
    
    IF v_avatar_count = 0 THEN
        RAISE NOTICE 'No players are using avatar URLs. No fix needed.';
    ELSE
        RAISE NOTICE 'Found % players using avatar URLs. Will proceed with fixes.', v_avatar_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Try to restore original URLs from tournament_registrations table
DO $$
DECLARE
    v_updated_count INTEGER;
    v_valid_url_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== APPROACH 1: RESTORE ORIGINAL URLS ===';
    
    -- Count valid URLs in tournament_registrations
    SELECT COUNT(*) INTO v_valid_url_count 
    FROM tournament_registrations 
    WHERE profile_image_url IS NOT NULL 
    AND profile_image_url != '' 
    AND profile_image_url LIKE '%supabase%'
    AND registration_category::text LIKE 'VOLLEYBALL%';
    
    RAISE NOTICE 'Found % valid Supabase URLs in tournament_registrations table', v_valid_url_count;
    
    IF v_valid_url_count = 0 THEN
        RAISE NOTICE 'No valid URLs found in tournament_registrations table. Skipping this approach.';
    ELSE
        -- Update players table with original profile image URLs
        WITH updated_players AS (
            UPDATE players p
            SET profile_image_url = tr.profile_image_url
            FROM tournament_registrations tr
            WHERE p.id = tr.id
            AND tr.registration_category::text LIKE 'VOLLEYBALL%'
            AND tr.profile_image_url IS NOT NULL
            AND tr.profile_image_url != ''
            AND tr.profile_image_url LIKE '%supabase%'
            AND p.profile_image_url LIKE '%ui-avatars.com%'
            RETURNING p.id
        )
        SELECT COUNT(*) INTO v_updated_count FROM updated_players;
        
        RAISE NOTICE 'Restored original profile image URLs for % volleyball players', v_updated_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Try to extract URLs from registration_data field in players table
DO $$
DECLARE
    v_updated_count INTEGER;
    v_valid_url_count INTEGER;
    v_field_name TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== APPROACH 2: EXTRACT URLS FROM PLAYERS REGISTRATION_DATA ===';
    
    -- Check which field name is used in the registration_data JSONB
    -- Try different possible field names
    FOR v_field_name IN 
        SELECT unnest(ARRAY['profileImageUrl', 'profile_image_url', 'profile_url'])
    LOOP
        -- Count players with profile image URLs in registration_data using this field name
        EXECUTE format('
            SELECT COUNT(*) 
            FROM players p
            WHERE EXISTS (
                SELECT 1 FROM tournament_registrations tr 
                WHERE tr.id = p.id 
                AND tr.registration_category::text LIKE ''VOLLEYBALL%%''
            )
            AND p.registration_data IS NOT NULL
            AND p.registration_data ? ''%s''
            AND (p.registration_data->>''%s'') IS NOT NULL
            AND (p.registration_data->>''%s'') != ''''
            AND (p.registration_data->>''%s'') LIKE ''%%supabase%%''
            AND p.profile_image_url LIKE ''%%ui-avatars.com%%''
        ', v_field_name, v_field_name, v_field_name, v_field_name) INTO v_valid_url_count;
        
        RAISE NOTICE 'Checking field "%": found % players with valid URLs', v_field_name, v_valid_url_count;
        
        IF v_valid_url_count > 0 THEN
            -- Update players table with profile image URLs from registration_data using this field name
            EXECUTE format('
                WITH updated_players AS (
                    UPDATE players p
                    SET profile_image_url = p.registration_data->>''%s''
                    WHERE EXISTS (
                        SELECT 1 FROM tournament_registrations tr 
                        WHERE tr.id = p.id 
                        AND tr.registration_category::text LIKE ''VOLLEYBALL%%''
                    )
                    AND p.registration_data IS NOT NULL
                    AND p.registration_data ? ''%s''
                    AND (p.registration_data->>''%s'') IS NOT NULL
                    AND (p.registration_data->>''%s'') != ''''
                    AND (p.registration_data->>''%s'') LIKE ''%%supabase%%''
                    AND p.profile_image_url LIKE ''%%ui-avatars.com%%''
                    RETURNING p.id
                )
                SELECT COUNT(*) FROM updated_players
            ', v_field_name, v_field_name, v_field_name, v_field_name, v_field_name) INTO v_updated_count;
            
            RAISE NOTICE 'Updated profile image URLs for % volleyball players using field "%" from registration_data', v_updated_count, v_field_name;
        END IF;
    END LOOP;
    
    -- Check if any players were updated
    IF v_updated_count IS NULL OR v_updated_count = 0 THEN
        RAISE NOTICE 'No valid URLs found in players registration_data field. Skipping this approach.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Try to extract URLs from any field in registration_data that looks like a URL
DO $$
DECLARE
    v_updated_count INTEGER := 0;
    v_valid_url_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== APPROACH 3: DEEP SCAN REGISTRATION_DATA FOR URL PATTERNS ===';
    
    -- Create a temporary table to store potential URL fields
    CREATE TEMP TABLE potential_url_fields AS
    SELECT 
        p.id,
        p.name,
        key,
        value
    FROM 
        players p,
        jsonb_each_text(p.registration_data) AS fields(key, value)
    WHERE 
        EXISTS (
            SELECT 1 FROM tournament_registrations tr 
            WHERE tr.id = p.id 
            AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        )
        AND p.registration_data IS NOT NULL
        AND p.profile_image_url LIKE '%ui-avatars.com%'
        AND value LIKE '%supabase%'
        AND value LIKE '%.jpg%' OR value LIKE '%.jpeg%' OR value LIKE '%.png%' OR value LIKE '%.gif%';
    
    -- Count potential URL fields
    SELECT COUNT(*) INTO v_valid_url_count FROM potential_url_fields;
    
    RAISE NOTICE 'Found % potential URL fields in registration_data', v_valid_url_count;
    
    IF v_valid_url_count = 0 THEN
        RAISE NOTICE 'No URL-like fields found in registration_data. Skipping this approach.';
    ELSE
        -- Show sample of potential URL fields
        RAISE NOTICE 'Sample of potential URL fields:';
        FOR i IN 1..LEAST(5, v_valid_url_count) LOOP
            EXECUTE '
                SELECT name, key, value 
                FROM potential_url_fields 
                LIMIT 1 OFFSET ' || (i-1)
            INTO v_name, v_key, v_value;
            RAISE NOTICE 'Player: %, Field: %, Value: %', v_name, v_key, v_value;
        END LOOP;
        
        -- Update players with URL fields
        WITH updated_players AS (
            UPDATE players p
            SET profile_image_url = puf.value
            FROM potential_url_fields puf
            WHERE p.id = puf.id
            AND p.profile_image_url LIKE '%ui-avatars.com%'
            RETURNING p.id
        )
        SELECT COUNT(*) INTO v_updated_count FROM updated_players;
        
        RAISE NOTICE 'Updated profile image URLs for % volleyball players using URL fields from registration_data', v_updated_count;
    END IF;
    
    -- Drop the temporary table
    DROP TABLE IF EXISTS potential_url_fields;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Generate new URLs with UUIDs for remaining players
DO $$
DECLARE
    v_updated_count INTEGER;
    v_storage_url TEXT;
    v_bucket_name TEXT;
    v_file_extension TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== APPROACH 4: GENERATE NEW URLS WITH UUIDS ===';
    
    -- Get configuration variables
    v_storage_url := :'storage_base_url';
    v_bucket_name := :'bucket_name';
    v_file_extension := :'file_extension';
    
    RAISE NOTICE 'Using storage URL: %/%', v_storage_url, v_bucket_name;
    
    -- Count remaining players with avatar URLs
    SELECT COUNT(*) INTO v_updated_count 
    FROM players p
    WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = p.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    )
    AND p.profile_image_url LIKE '%ui-avatars.com%';
    
    RAISE NOTICE 'Found % remaining volleyball players with avatar URLs', v_updated_count;
    
    IF v_updated_count = 0 THEN
        RAISE NOTICE 'No remaining players with avatar URLs. Skipping this approach.';
    ELSE
        -- Update players to use Supabase storage URLs with UUIDs
        WITH updated_players AS (
            UPDATE players p
            SET profile_image_url = 
                -- Format: https://yfwormqkewwahqhtmrwh.supabase.co/storage/v1/object/public/tournament-media/profile-images/[UUID]-[timestamp].jpg
                v_storage_url || '/' || v_bucket_name || '/' || 
                REPLACE(uuid_generate_v4()::text, '-', '') || '-' || 
                EXTRACT(EPOCH FROM NOW())::bigint || '.' || v_file_extension
            WHERE EXISTS (
                SELECT 1 FROM tournament_registrations tr 
                WHERE tr.id = p.id 
                AND tr.registration_category::text LIKE 'VOLLEYBALL%'
            )
            AND p.profile_image_url LIKE '%ui-avatars.com%'
            RETURNING p.id
        )
        SELECT COUNT(*) INTO v_updated_count FROM updated_players;
        
        RAISE NOTICE 'Updated profile image URLs for % volleyball players with new UUID-based URLs', v_updated_count;
        RAISE NOTICE 'NOTE: These are placeholder URLs. You will need to upload actual images to these locations in Supabase storage.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Check final state
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
    RAISE NOTICE '=== FINAL STATE ===';
    RAISE NOTICE 'Total volleyball players: %', v_total_players;
    RAISE NOTICE 'Players using avatar URLs: %', v_avatar_count;
    RAISE NOTICE 'Players using Supabase URLs: %', v_supabase_count;
    
    IF v_avatar_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All volleyball players now use Supabase URLs.';
    ELSE
        RAISE NOTICE 'WARNING: % volleyball players are still using avatar URLs.', v_avatar_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Show sample of updated profile image URLs
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
--    - storage_base_url: Your Supabase storage URL (already set based on the example)
--    - bucket_name: The path to your profile images bucket (already set based on the example)
--    - file_extension: The file extension of your images (default is 'jpg')
--
-- 2. Run the script with:
--    \i comprehensive_profile_image_fix.sql
--
-- 3. This script will try four approaches in sequence:
--    - First, it will try to restore original URLs from the tournament_registrations table
--    - Then, it will try to extract URLs from known fields in the registration_data JSONB
--    - Next, it will scan all fields in registration_data for URL-like patterns
--    - Finally, it will generate new UUID-based URLs for any remaining players with avatar URLs
--
-- 4. IMPORTANT: If the script generates new UUID-based URLs, you will need to upload actual images
--    to these locations in Supabase storage. The script only updates the database records, not the actual image files. 