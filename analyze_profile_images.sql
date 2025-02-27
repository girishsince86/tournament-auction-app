-- Script to analyze profile image URLs in the tournament_registrations table
-- This script will check how many volleyball registrations have valid profile image URLs

-- Step 1: Count total volleyball registrations
DO $$
DECLARE
    v_total_registrations INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_registrations 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%';
    
    RAISE NOTICE 'Total volleyball registrations: %', v_total_registrations;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Analyze profile image URLs in volleyball registrations
DO $$
DECLARE
    v_null_count INTEGER;
    v_empty_count INTEGER;
    v_avatar_count INTEGER;
    v_valid_count INTEGER;
    v_total_count INTEGER;
BEGIN
    -- Count registrations with NULL profile_image_url
    SELECT COUNT(*) INTO v_null_count 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%'
    AND profile_image_url IS NULL;
    
    -- Count registrations with empty profile_image_url
    SELECT COUNT(*) INTO v_empty_count 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%'
    AND profile_image_url = '';
    
    -- Count registrations with ui-avatars.com URLs
    SELECT COUNT(*) INTO v_avatar_count 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%'
    AND profile_image_url LIKE '%ui-avatars.com%';
    
    -- Count registrations with other (potentially valid) URLs
    SELECT COUNT(*) INTO v_valid_count 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%'
    AND profile_image_url IS NOT NULL
    AND profile_image_url != ''
    AND profile_image_url NOT LIKE '%ui-avatars.com%';
    
    -- Get total count for verification
    SELECT COUNT(*) INTO v_total_count 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%';
    
    RAISE NOTICE 'Profile image URL analysis for volleyball registrations:';
    RAISE NOTICE '- NULL URLs: %', v_null_count;
    RAISE NOTICE '- Empty URLs: %', v_empty_count;
    RAISE NOTICE '- Avatar URLs: %', v_avatar_count;
    RAISE NOTICE '- Valid URLs: %', v_valid_count;
    RAISE NOTICE '- Total: % (should match total volleyball registrations)', v_null_count + v_empty_count + v_avatar_count + v_valid_count;
    
    IF v_null_count + v_empty_count + v_avatar_count + v_valid_count != v_total_count THEN
        RAISE NOTICE 'WARNING: The sum of URL types (%) does not match the total volleyball registrations (%)', 
            v_null_count + v_empty_count + v_avatar_count + v_valid_count, v_total_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Show sample of valid profile image URLs
SELECT 
    id,
    CONCAT(first_name, ' ', last_name) as name,
    profile_image_url
FROM tournament_registrations
WHERE registration_category::text LIKE 'VOLLEYBALL%'
AND profile_image_url IS NOT NULL
AND profile_image_url != ''
AND profile_image_url NOT LIKE '%ui-avatars.com%'
ORDER BY first_name, last_name
LIMIT 10;

-- Step 4: Count distinct profile image URLs
SELECT 
    COUNT(DISTINCT profile_image_url) as distinct_urls,
    COUNT(*) as total_registrations
FROM tournament_registrations
WHERE registration_category::text LIKE 'VOLLEYBALL%'
AND profile_image_url IS NOT NULL
AND profile_image_url != ''
AND profile_image_url NOT LIKE '%ui-avatars.com%';

-- Step 5: Show the most common profile image URLs
SELECT 
    profile_image_url,
    COUNT(*) as count
FROM tournament_registrations
WHERE registration_category::text LIKE 'VOLLEYBALL%'
AND profile_image_url IS NOT NULL
AND profile_image_url != ''
GROUP BY profile_image_url
ORDER BY COUNT(*) DESC
LIMIT 10; 