-- Update base prices for all players based on skill level
UPDATE players
SET 
    base_price = CASE skill_level
        WHEN 'COMPETITIVE_A' THEN 250
        WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
        WHEN 'INTERMEDIATE_B' THEN 150
        WHEN 'RECREATIONAL_C' THEN 100
        ELSE 100
    END,
    updated_at = NOW();

-- Create a function to automatically set base price when skill level changes
CREATE OR REPLACE FUNCTION update_base_price_on_skill_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.skill_level != OLD.skill_level THEN
        NEW.base_price := CASE NEW.skill_level
            WHEN 'COMPETITIVE_A' THEN 250
            WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
            WHEN 'INTERMEDIATE_B' THEN 150
            WHEN 'RECREATIONAL_C' THEN 100
            ELSE 100
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update base price when skill level changes
CREATE TRIGGER update_base_price_trigger
    BEFORE UPDATE ON players
    FOR EACH ROW
    WHEN (OLD.skill_level IS DISTINCT FROM NEW.skill_level)
    EXECUTE FUNCTION update_base_price_on_skill_change();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_base_price_on_skill_change TO authenticated;

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS update_base_price_trigger ON players;
DROP FUNCTION IF EXISTS update_base_price_on_skill_change;
*/ 