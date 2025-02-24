-- Add budget fields to teams table
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS initial_budget INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN IF NOT EXISTS remaining_budget INTEGER;

-- Set remaining_budget equal to initial_budget for existing teams
UPDATE teams
SET remaining_budget = initial_budget
WHERE remaining_budget IS NULL;

-- Add constraint to ensure remaining_budget doesn't go negative
ALTER TABLE teams
ADD CONSTRAINT remaining_budget_non_negative 
CHECK (remaining_budget >= 0);

-- Rollback SQL
/*
ALTER TABLE teams
DROP CONSTRAINT IF EXISTS remaining_budget_non_negative,
DROP COLUMN IF EXISTS initial_budget,
DROP COLUMN IF EXISTS remaining_budget;
*/ 