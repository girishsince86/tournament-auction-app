-- Script to fix the column name issue in the players table
-- This script explains the issue and provides a solution

-- Explanation of the issue:
/*
The error "column 'tournament_id' does not exist" occurs because the players table
does not have a column named 'tournament_id'. Instead, it has a column named 'current_team_id'.

This script demonstrates how to properly query the players table using the correct column names.
*/

-- Example 1: Show the structure of the players table
\d players

-- Example 2: Count players with NULL current_team_id (CORRECT way)
SELECT 
    COUNT(*) as players_with_null_team
FROM players
WHERE current_team_id IS NULL;

-- Example 3: Count players by team
SELECT 
    current_team_id,
    COUNT(*) as player_count
FROM players
GROUP BY current_team_id
ORDER BY player_count DESC;

-- Example 4: Join players with teams
SELECT 
    t.name as team_name,
    COUNT(p.id) as player_count
FROM players p
JOIN teams t ON p.current_team_id = t.id
GROUP BY t.name
ORDER BY player_count DESC;

-- Example 5: Find players without a team
SELECT 
    id,
    name,
    player_position,
    skill_level
FROM players
WHERE current_team_id IS NULL;

-- Recommendation:
-- Update all your scripts to use current_team_id instead of tournament_id
-- The following scripts have been updated to fix this issue:
-- 1. analyze_players_and_registrations.sql
-- 2. cleanup_and_reload_volleyball_players.sql
-- 3. copy_volleyball_registrations_to_players.sql
-- 4. manage_volleyball_players.sql
-- 5. volleyball_players_migration.sql

-- Note about the players table structure:
/*
The players table has the following structure:
- id (UUID): Primary key
- name (text): Player's name
- age (integer): Player's age
- player_position (enum): Player's position
- base_price (integer): Base price for auctions
- current_team_id (UUID): Reference to the teams table
- image_url (text): URL to player's image
- status (enum): Player's status (AVAILABLE, SOLD, etc.)
- phone_number (text): Player's phone number
- apartment_number (text): Player's apartment number
- jersey_number (text): Player's jersey number
- skill_level (enum): Player's skill level
- height (integer): Player's height
- tshirt_size (enum): Player's t-shirt size
- registration_data (jsonb): Additional registration data
- category_id (UUID): Reference to categories
- created_at (timestamp): Creation timestamp
- updated_at (timestamp): Update timestamp
*/ 