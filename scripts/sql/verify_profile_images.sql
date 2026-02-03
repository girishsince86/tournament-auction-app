-- Script to verify profile image URLs in the database
-- This script checks if profile image URLs are correctly set for volleyball players

-- Step 1: Check profile image URLs in players table
SELECT 
    COUNT(*) AS total_players,
    COUNT(CASE WHEN profile_image_url LIKE '%ui-avatars.com%' THEN 1 END) AS avatar_urls,
    COUNT(CASE WHEN profile_image_url LIKE '%supabase.co%' THEN 1 END) AS supabase_urls,
    COUNT(CASE WHEN profile_image_url IS NULL THEN 1 END) AS null_urls
FROM players
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = players.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
);

-- Step 2: Check profile image URLs in tournament_registrations table
SELECT 
    COUNT(*) AS total_registrations,
    COUNT(CASE WHEN profile_image_url LIKE '%ui-avatars.com%' THEN 1 END) AS avatar_urls,
    COUNT(CASE WHEN profile_image_url LIKE '%supabase.co%' THEN 1 END) AS supabase_urls,
    COUNT(CASE WHEN profile_image_url IS NULL THEN 1 END) AS null_urls
FROM tournament_registrations
WHERE registration_category::text LIKE 'VOLLEYBALL%';

-- Step 3: Check for mismatches between players and tournament_registrations tables
SELECT 
    p.id,
    p.name,
    p.profile_image_url AS player_url,
    tr.profile_image_url AS registration_url
FROM players p
JOIN tournament_registrations tr ON p.id = tr.id
WHERE tr.registration_category::text LIKE 'VOLLEYBALL%'
AND (
    (p.profile_image_url IS NULL AND tr.profile_image_url IS NOT NULL) OR
    (p.profile_image_url IS NOT NULL AND tr.profile_image_url IS NULL) OR
    (p.profile_image_url != tr.profile_image_url)
);

-- Step 4: List players with Supabase URLs
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
AND profile_image_url LIKE '%supabase.co%'
ORDER BY name
LIMIT 10;

-- Step 5: List players still using avatar URLs
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
AND profile_image_url LIKE '%ui-avatars.com%'
ORDER BY name
LIMIT 10;

-- Instructions:
-- 1. Run this script to verify the state of profile image URLs in the database:
--    \i verify_profile_images.sql
--
-- 2. Check the results to ensure that:
--    - Most players have Supabase URLs
--    - There are no mismatches between players and tournament_registrations tables
--
-- 3. If there are still players using avatar URLs, you may need to run the update script again
--    with additional image files. 