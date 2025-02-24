-- Add budget tracking triggers and functions
CREATE OR REPLACE FUNCTION validate_team_budget()
RETURNS TRIGGER AS $$
DECLARE
    team_budget INTEGER;
    team_spent INTEGER;
BEGIN
    -- Get team's initial budget
    SELECT initial_budget, remaining_budget INTO team_budget, team_spent
    FROM teams
    WHERE id = NEW.winning_team_id;

    -- Check if team has enough budget
    IF team_spent - NEW.final_points < 0 THEN
        RAISE EXCEPTION 'Team does not have enough budget. Required: %, Available: %', 
            NEW.final_points, team_spent;
    END IF;

    -- Update team's remaining budget
    UPDATE teams
    SET remaining_budget = remaining_budget - NEW.final_points
    WHERE id = NEW.winning_team_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget validation
CREATE TRIGGER check_team_budget
    BEFORE INSERT OR UPDATE ON auction_rounds
    FOR EACH ROW
    WHEN (NEW.status = 'COMPLETED' AND NEW.winning_team_id IS NOT NULL)
    EXECUTE FUNCTION validate_team_budget();

-- Add function to reset team budget
CREATE OR REPLACE FUNCTION reset_team_budget(p_team_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE teams
    SET remaining_budget = initial_budget
    WHERE id = p_team_id;
END;
$$ LANGUAGE plpgsql;

-- Add function to calculate team's total spent budget
CREATE OR REPLACE FUNCTION calculate_team_spent_budget(p_team_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_spent INTEGER;
BEGIN
    SELECT COALESCE(SUM(final_points), 0) INTO total_spent
    FROM auction_rounds
    WHERE winning_team_id = p_team_id
    AND status = 'COMPLETED';
    
    RETURN total_spent;
END;
$$ LANGUAGE plpgsql;

-- Add function to update all teams' remaining budgets
CREATE OR REPLACE FUNCTION update_all_team_budgets()
RETURNS void AS $$
DECLARE
    team_record RECORD;
BEGIN
    FOR team_record IN SELECT id, initial_budget FROM teams
    LOOP
        UPDATE teams
        SET remaining_budget = initial_budget - (
            SELECT COALESCE(SUM(final_points), 0)
            FROM auction_rounds
            WHERE winning_team_id = team_record.id
            AND status = 'COMPLETED'
        )
        WHERE id = team_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS check_team_budget ON auction_rounds;
DROP FUNCTION IF EXISTS validate_team_budget();
DROP FUNCTION IF EXISTS reset_team_budget(UUID);
DROP FUNCTION IF EXISTS calculate_team_spent_budget(UUID);
DROP FUNCTION IF EXISTS update_all_team_budgets();
*/ 