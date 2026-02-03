-- Disable user-defined validation triggers (USER excludes system/constraint triggers)
ALTER TABLE players DISABLE TRIGGER USER;
ALTER TABLE auction_rounds DISABLE TRIGGER USER;
ALTER TABLE teams DISABLE TRIGGER USER;

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