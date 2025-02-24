-- Create budget history table
CREATE TABLE budget_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('ALLOCATION', 'ADJUSTMENT', 'RESET')),
    points_change INTEGER NOT NULL,
    previous_budget INTEGER NOT NULL,
    new_budget INTEGER NOT NULL,
    reason TEXT,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX idx_budget_history_team ON budget_history(team_id);
CREATE INDEX idx_budget_history_tournament ON budget_history(tournament_id);
CREATE INDEX idx_budget_history_created_at ON budget_history(created_at);

-- Create function to record budget history
CREATE OR REPLACE FUNCTION record_budget_history()
RETURNS TRIGGER AS $$
DECLARE
    v_tournament_id UUID;
    v_points_change INTEGER;
BEGIN
    -- Get tournament_id from team
    SELECT tournament_id INTO v_tournament_id
    FROM teams
    WHERE id = NEW.id;

    -- Calculate points change
    v_points_change := NEW.remaining_budget - OLD.remaining_budget;

    -- Record history
    INSERT INTO budget_history (
        team_id,
        tournament_id,
        action_type,
        points_change,
        previous_budget,
        new_budget,
        reason,
        performed_by
    ) VALUES (
        NEW.id,
        v_tournament_id,
        CASE 
            WHEN TG_OP = 'UPDATE' AND NEW.remaining_budget != OLD.remaining_budget THEN 'ADJUSTMENT'
            WHEN NEW.remaining_budget = NEW.initial_budget THEN 'RESET'
            ELSE 'ALLOCATION'
        END,
        v_points_change,
        OLD.remaining_budget,
        NEW.remaining_budget,
        current_setting('app.budget_change_reason', true),
        current_setting('request.jwt.claim.sub', true)::UUID
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget history
CREATE TRIGGER record_budget_changes
    AFTER UPDATE OF remaining_budget ON teams
    FOR EACH ROW
    EXECUTE FUNCTION record_budget_history();

-- Add function to get team budget alerts
CREATE OR REPLACE FUNCTION get_team_budget_alerts(p_team_id UUID)
RETURNS TABLE (
    alert_type TEXT,
    message TEXT,
    remaining_budget INTEGER,
    percentage_remaining NUMERIC
) AS $$
DECLARE
    v_initial_budget INTEGER;
    v_remaining_budget INTEGER;
    v_percentage NUMERIC;
BEGIN
    -- Get team budgets
    SELECT 
        initial_budget,
        remaining_budget,
        (remaining_budget::NUMERIC / initial_budget::NUMERIC * 100)
    INTO 
        v_initial_budget,
        v_remaining_budget,
        v_percentage
    FROM teams
    WHERE id = p_team_id;

    -- Return alerts based on remaining budget
    IF v_percentage <= 10 THEN
        RETURN QUERY SELECT 
            'CRITICAL'::TEXT,
            'Critical: Less than 10% budget remaining'::TEXT,
            v_remaining_budget,
            v_percentage;
    ELSIF v_percentage <= 25 THEN
        RETURN QUERY SELECT 
            'WARNING'::TEXT,
            'Warning: Less than 25% budget remaining'::TEXT,
            v_remaining_budget,
            v_percentage;
    ELSIF v_percentage <= 50 THEN
        RETURN QUERY SELECT 
            'INFO'::TEXT,
            'Info: Less than 50% budget remaining'::TEXT,
            v_remaining_budget,
            v_percentage;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add function for admin budget adjustment
CREATE OR REPLACE FUNCTION adjust_team_budget(
    p_team_id UUID,
    p_adjustment INTEGER,
    p_reason TEXT
)
RETURNS void AS $$
BEGIN
    -- Set reason for history tracking
    PERFORM set_config('app.budget_change_reason', p_reason, true);
    
    -- Update team budget
    UPDATE teams
    SET remaining_budget = remaining_budget + p_adjustment
    WHERE id = p_team_id;

    -- Clear reason
    PERFORM set_config('app.budget_change_reason', NULL, true);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE budget_history ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Budget history viewable by authenticated users"
    ON budget_history FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Budget history modifiable by admin users"
    ON budget_history FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS record_budget_changes ON teams;
DROP FUNCTION IF EXISTS record_budget_history();
DROP FUNCTION IF EXISTS get_team_budget_alerts(UUID);
DROP FUNCTION IF EXISTS adjust_team_budget(UUID, INTEGER, TEXT);
DROP TABLE IF EXISTS budget_history;
*/ 