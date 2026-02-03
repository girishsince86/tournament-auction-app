-- Script to update profile image URLs for existing players
-- This script will update the profile_image_url field for players, using the original URL from tournament_registrations when available

-- Step 1: Check current profile image URLs
DO $$
DECLARE
    v_distinct_urls INTEGER;
    v_total_players INTEGER;
BEGIN
    SELECT COUNT(DISTINCT profile_image_url) INTO v_distinct_urls FROM players;
    SELECT COUNT(*) INTO v_total_players FROM players;
    
    RAISE NOTICE 'Current state:';
    RAISE NOTICE '- Total players: %', v_total_players;
    RAISE NOTICE '- Distinct profile image URLs: %', v_distinct_urls;
    
    IF v_distinct_urls = 1 THEN
        RAISE NOTICE 'All players have the same profile image URL. This script will update them to use original URLs when available.';
    ELSIF v_distinct_urls < v_total_players THEN
        RAISE NOTICE 'Some players share the same profile image URL. This script will update them to use original URLs when available.';
    ELSE
        RAISE NOTICE 'All players already have unique profile image URLs. Checking if they are using original URLs...';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Update profile image URLs for players from volleyball registrations
DO $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    WITH updated_players AS (
        UPDATE players p
        SET profile_image_url = 
            CASE 
                -- Use the original URL from tournament_registrations if it exists and is not empty
                WHEN tr.profile_image_url IS NOT NULL AND tr.profile_image_url != '' AND tr.profile_image_url NOT LIKE '%ui-avatars.com%'
                THEN tr.profile_image_url
                -- Otherwise generate an avatar URL
                ELSE 'https://ui-avatars.com/api/?name=' || REPLACE(p.name, ' ', '+') || '&size=256&background=random'
            END
        FROM tournament_registrations tr
        WHERE p.id = tr.id
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
        RETURNING p.id
    )
    SELECT COUNT(*) INTO v_updated_count FROM updated_players;
    
    RAISE NOTICE 'Updated profile image URLs for % volleyball players', v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Check updated profile image URLs
DO $$
DECLARE
    v_distinct_urls INTEGER;
    v_total_players INTEGER;
    v_avatar_count INTEGER;
    v_original_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT profile_image_url) INTO v_distinct_urls FROM players;
    SELECT COUNT(*) INTO v_total_players FROM players;
    SELECT COUNT(*) INTO v_avatar_count FROM players WHERE profile_image_url LIKE '%ui-avatars.com%';
    SELECT COUNT(*) INTO v_original_count FROM players WHERE profile_image_url NOT LIKE '%ui-avatars.com%';
    
    RAISE NOTICE 'Updated state:';
    RAISE NOTICE '- Total players: %', v_total_players;
    RAISE NOTICE '- Distinct profile image URLs: %', v_distinct_urls;
    RAISE NOTICE '- Players using avatar URLs: %', v_avatar_count;
    RAISE NOTICE '- Players using original URLs: %', v_original_count;
    
    IF v_distinct_urls = v_total_players THEN
        RAISE NOTICE 'SUCCESS: All players now have unique profile image URLs.';
    ELSE
        RAISE NOTICE 'WARNING: Some players still share the same profile image URL.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Show sample of updated profile image URLs
SELECT 
    p.id, 
    p.name, 
    p.profile_image_url,
    tr.profile_image_url as original_url
FROM players p
JOIN tournament_registrations tr ON p.id = tr.id
WHERE tr.registration_category::text LIKE 'VOLLEYBALL%'
ORDER BY 
    CASE WHEN p.profile_image_url LIKE '%ui-avatars.com%' THEN 1 ELSE 0 END,
    p.name
LIMIT 10; 