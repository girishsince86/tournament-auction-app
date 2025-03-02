-- Disable all validation triggers on players table
ALTER TABLE players DISABLE TRIGGER validate_combined_requirements;
ALTER TABLE players DISABLE TRIGGER validate_team_requirements;
ALTER TABLE players DISABLE TRIGGER ALL;

-- Disable all validation triggers on auction_rounds table
ALTER TABLE auction_rounds DISABLE TRIGGER ALL;

-- Disable all validation triggers on teams table
ALTER TABLE teams DISABLE TRIGGER ALL;

-- Create empty dummy functions for any that might be missing
CREATE OR REPLACE FUNCTION check_combined_requirements()
RETURNS TRIGGER AS $$
BEGIN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_team_requirements()
RETURNS TRIGGER AS $$
BEGIN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log the emergency change
DO $$
BEGIN
    RAISE NOTICE 'EMERGENCY: All validation triggers disabled for live auction';
    
    -- Check if migration_logs table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migration_logs'
    ) THEN
        INSERT INTO migration_logs (migration_name, description, executed_at)
        VALUES (
            '20240602000002_disable_all_validations',
            'EMERGENCY: Disabled all validation triggers for live auction',
            NOW()
        )
        ON CONFLICT (migration_name) DO NOTHING;
    END IF;
END
$$; 