-- Reset all player allocations
-- 1. Update players table to set status to AVAILABLE and remove team associations
UPDATE players
SET 
    status = 'AVAILABLE',
    current_team_id = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    status = 'ALLOCATED';

-- 2. Update teams to reset their remaining budget to initial budget
UPDATE teams
SET 
    remaining_budget = initial_budget,
    updated_at = CURRENT_TIMESTAMP;

-- 3. Mark all auction rounds as inactive
UPDATE auction_rounds
SET 
    status = 'NOT_STARTED',
    winning_team_id = NULL,
    final_points = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    status = 'COMPLETED' OR status = 'ACTIVE';

-- 4. Output the number of players reset
SELECT 'Players reset to AVAILABLE status' as operation, COUNT(*) as count
FROM players
WHERE status = 'AVAILABLE';

-- 5. Output the number of teams with reset budgets
SELECT 'Teams with reset budgets' as operation, COUNT(*) as count
FROM teams
WHERE remaining_budget = initial_budget; 