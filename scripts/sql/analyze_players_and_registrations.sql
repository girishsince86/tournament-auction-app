-- Script to analyze the current state of the Players table and tournament registrations
-- This script will help diagnose issues with the Players table and tournament registrations

-- Analysis 1: Count players and registrations by category
DO $$
DECLARE
    v_total_players INTEGER;
    v_players_from_registrations INTEGER;
    v_players_from_volleyball INTEGER;
    v_players_without_registrations INTEGER;
    v_total_registrations INTEGER;
    v_volleyball_registrations INTEGER;
BEGIN
    -- Count total players
    SELECT COUNT(*) INTO v_total_players FROM players;
    
    -- Count players that came from registrations
    SELECT COUNT(*) INTO v_players_from_registrations 
    FROM players p
    WHERE EXISTS (
        SELECT 1 
        FROM tournament_registrations tr 
        WHERE tr.id = p.id
    );
    
    -- Count players that came from volleyball registrations
    SELECT COUNT(*) INTO v_players_from_volleyball 
    FROM players p
    WHERE EXISTS (
        SELECT 1 
        FROM tournament_registrations tr 
        WHERE tr.id = p.id
        AND tr.registration_category::text LIKE 'VOLLEYBALL%'
    );
    
    -- Count players without corresponding registration records
    SELECT COUNT(*) INTO v_players_without_registrations 
    FROM players p
    WHERE NOT EXISTS (
        SELECT 1 
        FROM tournament_registrations tr 
        WHERE tr.id = p.id
    );
    
    -- Count total registrations
    SELECT COUNT(*) INTO v_total_registrations FROM tournament_registrations;
    
    -- Count volleyball registrations
    SELECT COUNT(*) INTO v_volleyball_registrations 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%';
    
    -- Output results
    RAISE NOTICE 'Player and Registration Analysis:';
    RAISE NOTICE '- Total players: %', v_total_players;
    RAISE NOTICE '- Players from registrations: %', v_players_from_registrations;
    RAISE NOTICE '- Players from volleyball registrations: %', v_players_from_volleyball;
    RAISE NOTICE '- Players without registrations: %', v_players_without_registrations;
    RAISE NOTICE '- Total registrations: %', v_total_registrations;
    RAISE NOTICE '- Volleyball registrations: %', v_volleyball_registrations;
END;
$$ LANGUAGE plpgsql;

-- Analysis 2: Detailed breakdown of registration categories
SELECT 
    registration_category,
    COUNT(*) as registration_count
FROM tournament_registrations
GROUP BY registration_category
ORDER BY registration_count DESC;

-- Analysis 3: Detailed breakdown of player skill levels
SELECT 
    skill_level,
    COUNT(*) as player_count
FROM players
GROUP BY skill_level
ORDER BY player_count DESC;

-- Analysis 4: Find duplicate players (same name)
SELECT 
    name, 
    COUNT(*) as count
FROM players
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Analysis 5: Find players with registration data but no matching registration
SELECT 
    id, 
    name, 
    registration_data->>'registration_category' as registration_category
FROM players
WHERE registration_data IS NOT NULL
AND NOT EXISTS (
    SELECT 1 
    FROM tournament_registrations tr 
    WHERE tr.id = players.id
)
LIMIT 20;

-- Analysis 6: Find volleyball registrations without players
SELECT 
    tr.id, 
    CONCAT(tr.first_name, ' ', tr.last_name) as name,
    tr.registration_category
FROM tournament_registrations tr
WHERE tr.registration_category::text LIKE 'VOLLEYBALL%'
AND NOT EXISTS (
    SELECT 1 
    FROM players p 
    WHERE p.id = tr.id
)
LIMIT 20;

-- Analysis 7: Check for players with NULL current_team_id
SELECT 
    COUNT(*) as players_with_null_team
FROM players
WHERE current_team_id IS NULL;

-- Recommendation based on analysis:
/*
Based on the analysis above, here's what you should do:

1. If you want to keep manually created players and only reset registration-based players:
   - Run reset_players_table.sql (Option 2 is enabled by default)
   - Then run copy_volleyball_registrations_to_players.sql

2. If you want a complete reset and only have volleyball players:
   - Run reset_players_table.sql (uncomment Option 1)
   - Then run copy_volleyball_registrations_to_players.sql

3. For a comprehensive solution that handles cleanup and reload in one script:
   - Run cleanup_and_reload_volleyball_players.sql
*/ 