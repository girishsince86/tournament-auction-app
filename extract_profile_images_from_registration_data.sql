-- Script to extract profile image URLs from registration_data JSON field
-- This script will check if there are profile image URLs in the registration_data JSON field
-- and update the profile_image_url field in the players table

-- Step 1: Analyze registration_data JSON field for profile image URLs
DO $$
DECLARE
    v_valid_url_count INTEGER := 0;
    v_total_players INTEGER;
    v_field_name TEXT;
    v_field_count INTEGER;
BEGIN
    -- Count total volleyball players
    SELECT COUNT(*) INTO v_total_players 
    FROM players p
    WHERE EXISTS (
        SELECT 1 FROM tournament_registrations tr 
        WHERE tr.id = p.id 
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    );
    
    RAISE NOTICE 'Registration data analysis:';
    RAISE NOTICE '- Total volleyball players: %', v_total_players;
    
    -- Check which field names are used in the registration_data JSONB
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
        ', v_field_name, v_field_name, v_field_name) INTO v_field_count;
        
        RAISE NOTICE '- Players with "%" in registration_data: %', v_field_name, v_field_count;
        v_valid_url_count := v_valid_url_count + v_field_count;
    END LOOP;
    
    IF v_valid_url_count = 0 THEN
        RAISE NOTICE 'WARNING: No profile image URLs found in registration_data JSON field. Cannot extract URLs.';
    ELSE
        RAISE NOTICE 'Found % players with profile image URLs in registration_data. Will proceed with extraction.', v_valid_url_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Show sample of registration_data JSON field with profile image URLs
DO $$
DECLARE
    v_field_name TEXT;
BEGIN
    -- Try different possible field names
    FOR v_field_name IN 
        SELECT unnest(ARRAY['profileImageUrl', 'profile_image_url', 'profile_url'])
    LOOP
        -- Show sample of players with this field name
        EXECUTE format('
            SELECT 
                p.id, 
                p.name, 
                ''%s'' as field_name,
                p.registration_data->>''%s'' as profile_image_url_from_json
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
            ORDER BY p.name
            LIMIT 5
        ', v_field_name, v_field_name, v_field_name, v_field_name, v_field_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Update profile_image_url in players table with URLs from registration_data
DO $$
DECLARE
    v_updated_count INTEGER := 0;
    v_field_name TEXT;
    v_field_updated_count INTEGER;
BEGIN
    -- Try different possible field names
    FOR v_field_name IN 
        SELECT unnest(ARRAY['profileImageUrl', 'profile_image_url', 'profile_url'])
    LOOP
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
                AND p.profile_image_url LIKE ''%%ui-avatars.com%%''
                RETURNING p.id
            )
            SELECT COUNT(*) FROM updated_players
        ', v_field_name, v_field_name, v_field_name, v_field_name) INTO v_field_updated_count;
        
        RAISE NOTICE 'Updated % volleyball players using field "%" from registration_data', v_field_updated_count, v_field_name;
        v_updated_count := v_updated_count + v_field_updated_count;
    END LOOP;
    
    RAISE NOTICE 'Total updated profile image URLs: %', v_updated_count;
    
    IF v_updated_count = 0 THEN
        RAISE NOTICE 'WARNING: No profile image URLs were updated. Check if valid URLs exist in registration_data JSON field.';
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
-- 1. Run this script to extract profile image URLs from registration_data JSON field in the players table:
--    \i extract_profile_images_from_registration_data.sql
--
-- 2. If no valid URLs are found in registration_data JSON field, you'll need to use one of the other scripts:
--    - restore_original_profile_images.sql (to restore URLs from profile_image_url field in tournament_registrations)
--    - update_player_profile_images_from_supabase.sql (to generate new URLs with UUIDs)
--    - update_player_profile_images_manual_mapping.sql (to manually map player names to filenames)
--
-- 3. If only some players have valid URLs in registration_data JSON field, you can run this script first
--    to extract those URLs, then use one of the other scripts to update the remaining players. 