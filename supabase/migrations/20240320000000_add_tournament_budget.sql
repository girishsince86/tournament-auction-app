-- Add team_budget column to tournaments table
ALTER TABLE tournaments
ADD COLUMN team_budget INTEGER NOT NULL DEFAULT 5000000;

-- Update existing tournaments to have the default budget
UPDATE tournaments SET team_budget = 5000000 WHERE team_budget IS NULL;

-- Add a trigger to set team budgets when creating teams
CREATE OR REPLACE FUNCTION set_team_budget()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the tournament budget
    SELECT team_budget INTO NEW.initial_budget
    FROM tournaments
    WHERE id = NEW.tournament_id;
    
    -- Set the remaining budget equal to initial budget
    NEW.remaining_budget = NEW.initial_budget;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS set_team_budget_trigger ON teams;
CREATE TRIGGER set_team_budget_trigger
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION set_team_budget();
