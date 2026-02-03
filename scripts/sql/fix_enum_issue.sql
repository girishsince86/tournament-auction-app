-- Script to fix the enum type issue with registration_category
-- This script explains the issue and provides a solution

-- Explanation of the issue:
/*
The error "operator does not exist: registration_category ~~ unknown" occurs because
the LIKE operator cannot be directly used with enum types. The registration_category
column is defined as an enum type, not a text type.

To fix this issue, we need to cast the enum type to text before using the LIKE operator:
registration_category::text LIKE 'VOLLEYBALL%'

This script demonstrates how to properly query volleyball registrations using the enum type.
*/

-- Example 1: Count volleyball registrations (CORRECT way)
SELECT 
    COUNT(*) as volleyball_registrations
FROM tournament_registrations
WHERE registration_category::text LIKE 'VOLLEYBALL%';

-- Example 2: List all registration categories
SELECT 
    DISTINCT registration_category::text as category
FROM tournament_registrations
ORDER BY category;

-- Example 3: Count registrations by category
SELECT 
    registration_category::text as category,
    COUNT(*) as count
FROM tournament_registrations
GROUP BY registration_category
ORDER BY count DESC;

-- Example 4: Find volleyball players
SELECT 
    COUNT(*) as volleyball_players
FROM players p
WHERE EXISTS (
    SELECT 1 
    FROM tournament_registrations tr 
    WHERE tr.id = p.id
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
);

-- Example 5: Alternative approach using enum values directly
-- If you know the exact enum values, you can use them directly without LIKE
SELECT 
    COUNT(*) as volleyball_registrations
FROM tournament_registrations
WHERE registration_category = 'VOLLEYBALL_OPEN_MEN';

-- Note: If you need to match multiple specific enum values, you can use IN:
SELECT 
    COUNT(*) as volleyball_registrations
FROM tournament_registrations
WHERE registration_category IN ('VOLLEYBALL_OPEN_MEN', 'VOLLEYBALL_WOMEN');

-- Recommendation:
-- Update all your scripts to use registration_category::text when using the LIKE operator
-- The following scripts have been updated to fix this issue:
-- 1. cleanup_and_reload_volleyball_players.sql
-- 2. reset_players_table.sql
-- 3. analyze_players_and_registrations.sql 