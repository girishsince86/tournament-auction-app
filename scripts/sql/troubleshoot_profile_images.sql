-- Script to troubleshoot profile image issues
-- This script helps identify and fix common issues with profile images

-- Step 1: Check for invalid URLs
SELECT 
    id,
    name,
    profile_image_url
FROM players
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = players.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
AND profile_image_url IS NOT NULL
AND profile_image_url NOT LIKE 'https://%'
LIMIT 10;

-- Step 2: Check for duplicate image assignments
WITH image_counts AS (
    SELECT 
        SUBSTRING(profile_image_url FROM '([^/]+)$') AS filename,
        COUNT(*) AS usage_count
    FROM players
    WHERE profile_image_url LIKE '%supabase.co%'
    GROUP BY filename
    HAVING COUNT(*) > 1
)
SELECT 
    ic.filename,
    ic.usage_count,
    array_agg(p.name) AS player_names
FROM image_counts ic
JOIN players p ON SUBSTRING(p.profile_image_url FROM '([^/]+)$') = ic.filename
GROUP BY ic.filename, ic.usage_count
ORDER BY ic.usage_count DESC;

-- Step 3: Check for missing images in tournament_registrations
SELECT 
    p.id,
    p.name,
    p.profile_image_url
FROM players p
JOIN tournament_registrations tr ON p.id = tr.id
WHERE tr.registration_category::text LIKE 'VOLLEYBALL%'
AND p.profile_image_url LIKE '%supabase.co%'
AND (tr.profile_image_url IS NULL OR tr.profile_image_url != p.profile_image_url);

-- Step 4: Fix missing images in tournament_registrations
DO $$
DECLARE
    v_fixed_count INTEGER;
BEGIN
    WITH fixed_registrations AS (
        UPDATE tournament_registrations tr
        SET profile_image_url = p.profile_image_url
        FROM players p
        WHERE tr.id = p.id
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        AND p.profile_image_url LIKE '%supabase.co%'
        AND (tr.profile_image_url IS NULL OR tr.profile_image_url != p.profile_image_url)
        RETURNING tr.id
    )
    SELECT COUNT(*) INTO v_fixed_count FROM fixed_registrations;
    
    RAISE NOTICE 'Fixed % tournament registrations with missing or mismatched profile image URLs', v_fixed_count;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Check for missing images in players table
SELECT 
    tr.id,
    tr.first_name || ' ' || tr.last_name AS name,
    tr.profile_image_url
FROM tournament_registrations tr
LEFT JOIN players p ON tr.id = p.id
WHERE tr.registration_category::text LIKE 'VOLLEYBALL%'
AND tr.profile_image_url LIKE '%supabase.co%'
AND (p.profile_image_url IS NULL OR p.profile_image_url != tr.profile_image_url);

-- Step 6: Fix missing images in players table
DO $$
DECLARE
    v_fixed_count INTEGER;
BEGIN
    WITH fixed_players AS (
        UPDATE players p
        SET profile_image_url = tr.profile_image_url
        FROM tournament_registrations tr
        WHERE p.id = tr.id
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        AND tr.profile_image_url LIKE '%supabase.co%'
        AND (p.profile_image_url IS NULL OR p.profile_image_url != tr.profile_image_url)
        RETURNING p.id
    )
    SELECT COUNT(*) INTO v_fixed_count FROM fixed_players;
    
    RAISE NOTICE 'Fixed % players with missing or mismatched profile image URLs', v_fixed_count;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Check for players with no profile image URL
SELECT 
    id,
    name
FROM players
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = players.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
AND profile_image_url IS NULL;

-- Step 8: Generate default avatar URLs for players with no profile image
DO $$
DECLARE
    v_fixed_count INTEGER;
BEGIN
    WITH fixed_players AS (
        UPDATE players p
        SET profile_image_url = 'https://ui-avatars.com/api/?name=' || REPLACE(p.name, ' ', '+') || '&size=256&background=random'
        WHERE EXISTS (
            SELECT 1 FROM tournament_registrations tr 
            WHERE tr.id = p.id 
            AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        )
        AND p.profile_image_url IS NULL
        RETURNING p.id
    )
    SELECT COUNT(*) INTO v_fixed_count FROM fixed_players;
    
    RAISE NOTICE 'Generated default avatar URLs for % players with no profile image', v_fixed_count;
END;
$$ LANGUAGE plpgsql;

-- Instructions:
-- 1. Run this script to identify and fix common issues with profile images:
--    \i troubleshoot_profile_images.sql
--
-- 2. The script will:
--    - Check for invalid URLs
--    - Check for duplicate image assignments
--    - Fix mismatches between players and tournament_registrations tables
--    - Generate default avatar URLs for players with no profile image
--
-- 3. Review the results and run the script again if needed. 