-- Script to run the volleyball migration functions
-- This script demonstrates how to run the functions in the volleyball_players_migration.sql file

-- First, make sure the functions are loaded
\i volleyball_players_migration.sql

-- Option 1: Run the complete migration with cleanup
-- This will:
-- 1. Clean up existing volleyball players
-- 2. Copy new volleyball registrations
-- 3. Update any existing players
SELECT * FROM execute_volleyball_players_migration(NULL, TRUE, TRUE);

-- Option 2: Run only the cleanup function
-- Uncomment the following line to run only the cleanup
-- SELECT * FROM cleanup_volleyball_players();

-- Option 3: Run only the copy function
-- Uncomment the following line to run only the copy
-- SELECT * FROM copy_volleyball_registrations_to_players();

-- Option 4: Run only the update function
-- Uncomment the following line to run only the update
-- SELECT * FROM update_players_from_volleyball_registrations();

-- Option 5: Get statistics about volleyball players
-- Uncomment the following line to get statistics
-- SELECT * FROM get_volleyball_players_statistics();

-- Option 6: Run the migration without cleanup
-- This will:
-- 1. Copy new volleyball registrations
-- 2. Update any existing players
-- Uncomment the following line to run without cleanup
-- SELECT * FROM execute_volleyball_players_migration(NULL, TRUE, FALSE);

-- Option 7: Run the migration with cleanup but without updating existing players
-- This will:
-- 1. Clean up existing volleyball players
-- 2. Copy new volleyball registrations
-- Uncomment the following line to run with cleanup but without updating
-- SELECT * FROM execute_volleyball_players_migration(NULL, FALSE, TRUE);

-- Note: If you want to specify a team ID, replace NULL with the UUID of the team
-- Example: SELECT * FROM execute_volleyball_players_migration('12345678-1234-1234-1234-123456789012', TRUE, TRUE); 