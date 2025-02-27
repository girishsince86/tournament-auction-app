-- Update default budget for new teams
ALTER TABLE teams 
ALTER COLUMN initial_budget SET DEFAULT 1000000000,
ALTER COLUMN remaining_budget SET DEFAULT 1000000000;

-- Update tournament team_budget
ALTER TABLE tournaments
ALTER COLUMN team_budget SET DEFAULT 1000000000;

-- Update existing teams to have 100 crore budget
UPDATE teams
SET initial_budget = 1000000000,
    remaining_budget = 1000000000 - (initial_budget - remaining_budget);

-- Update existing tournaments
UPDATE tournaments
SET team_budget = 1000000000
WHERE team_budget = 5000000; 