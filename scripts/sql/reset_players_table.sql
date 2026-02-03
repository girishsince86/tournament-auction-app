-- Script to reset the Players table with options for how to proceed
-- This script provides several options for cleaning up and resetting the Players table

-- Option 1: Delete ALL players (complete reset)
-- Uncomment the following block to delete ALL players
/*
DO $$
BEGIN
    DELETE FROM players;
    RAISE NOTICE 'Deleted ALL players from the Players table';
END;
$$ LANGUAGE plpgsql;
*/

-- Option 2: Delete only players that came from registrations
-- This preserves any manually created players
DO $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    WITH deleted_players AS (
        DELETE FROM players p
        WHERE EXISTS (
            SELECT 1 
            FROM tournament_registrations tr 
            WHERE tr.id = p.id
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_players;
    
    RAISE NOTICE 'Deleted % players that came from registrations', v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Option 3: Delete only players that came from volleyball registrations
-- Uncomment the following block to delete only volleyball players
/*
DO $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    WITH deleted_players AS (
        DELETE FROM players p
        WHERE EXISTS (
            SELECT 1 
            FROM tournament_registrations tr 
            WHERE tr.id = p.id
            AND tr.registration_category::text LIKE 'VOLLEYBALL%' -- Convert enum to text before using LIKE
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_players;
    
    RAISE NOTICE 'Deleted % players that came from volleyball registrations', v_deleted_count;
END;
$$ LANGUAGE plpgsql;
*/

-- Option 4: Delete orphaned players (players without corresponding registration records)
-- Uncomment the following block to delete orphaned players
/*
DO $$
DECLARE
    v_orphaned_count INTEGER;
BEGIN
    WITH orphaned_players AS (
        DELETE FROM players p
        WHERE NOT EXISTS (
            SELECT 1 
            FROM tournament_registrations tr 
            WHERE tr.id = p.id
        )
        AND p.registration_data IS NOT NULL -- Only delete players that were created from registrations
        RETURNING id
    )
    SELECT COUNT(*) INTO v_orphaned_count FROM orphaned_players;
    
    RAISE NOTICE 'Deleted % orphaned players (without corresponding registration records)', v_orphaned_count;
END;
$$ LANGUAGE plpgsql;
*/

-- Get current player count
DO $$
DECLARE
    v_player_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_player_count FROM players;
    RAISE NOTICE 'Current player count after cleanup: %', v_player_count;
END;
$$ LANGUAGE plpgsql;

-- Count volleyball registrations
DO $$
DECLARE
    v_volleyball_registrations INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_volleyball_registrations 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%'; -- Convert enum to text before using LIKE
    
    RAISE NOTICE 'Total volleyball registrations: %', v_volleyball_registrations;
END;
$$ LANGUAGE plpgsql;

-- Next steps:
-- After running this script to clean up the Players table, you can:
-- 1. Run copy_volleyball_registrations_to_players.sql to copy only volleyball registrations
-- 2. Run volleyball_players_migration.sql with the appropriate options
-- 3. Run cleanup_and_reload_volleyball_players.sql for a complete solution 