-- Add max_bid column to preferred_players table
ALTER TABLE preferred_players
ADD COLUMN max_bid INTEGER;

-- Update existing preferred players with max_bid based on skill level
UPDATE preferred_players pp
SET max_bid = (
    SELECT 
        CASE p.skill_level
            WHEN 'COMPETITIVE_A' THEN 250
            WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
            WHEN 'INTERMEDIATE_B' THEN 150
            WHEN 'RECREATIONAL_C' THEN 100
            ELSE 100
        END
    FROM players p
    WHERE p.id = pp.player_id
);

-- Make max_bid NOT NULL after setting defaults
ALTER TABLE preferred_players 
ALTER COLUMN max_bid SET NOT NULL;

-- Update the team budget analysis view to use max_bid instead of calculated values
CREATE OR REPLACE VIEW team_budget_analysis AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.initial_budget,
    t.remaining_budget,
    COUNT(pp.player_id) as number_of_preferred_players,
    COALESCE(SUM(pp.max_bid), 0) as total_preferred_points,
    t.initial_budget - COALESCE(SUM(pp.max_bid), 0) as potential_remaining_budget
FROM teams t
LEFT JOIN preferred_players pp ON pp.team_id = t.id
WHERE t.tournament_id = '11111111-1111-1111-1111-111111111111'
GROUP BY t.id, t.name, t.initial_budget, t.remaining_budget;

-- Create or replace function to validate max bid
CREATE OR REPLACE FUNCTION validate_max_bid()
RETURNS TRIGGER AS $$
DECLARE
    v_base_price INTEGER;
BEGIN
    -- Get player's base price
    SELECT base_price INTO v_base_price
    FROM players 
    WHERE id = NEW.player_id;

    -- Ensure max_bid is not less than base price
    IF NEW.max_bid < v_base_price THEN
        RAISE EXCEPTION 'Max bid (%) cannot be less than player base price (%)', NEW.max_bid, v_base_price;
    END IF;

    -- Ensure max_bid doesn't exceed team's remaining budget
    IF NEW.max_bid > (
        SELECT remaining_budget 
        FROM teams 
        WHERE id = NEW.team_id
    ) THEN
        RAISE EXCEPTION 'Max bid cannot exceed team remaining budget';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for max bid validation
CREATE TRIGGER validate_max_bid_before_insert_update
    BEFORE INSERT OR UPDATE ON preferred_players
    FOR EACH ROW
    EXECUTE FUNCTION validate_max_bid();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_max_bid TO authenticated;

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS validate_max_bid_before_insert_update ON preferred_players;
DROP FUNCTION IF EXISTS validate_max_bid;
ALTER TABLE preferred_players DROP COLUMN IF EXISTS max_bid;
*/ 