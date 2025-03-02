-- Get a list of all user-defined triggers on players table and disable them
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'players'::regclass 
        AND NOT tgisinternal
    LOOP
        EXECUTE format('ALTER TABLE players DISABLE TRIGGER %I', trigger_rec.tgname);
        RAISE NOTICE 'Disabled trigger % on players table', trigger_rec.tgname;
    END LOOP;
    
    -- Do the same for auction_rounds
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'auction_rounds'::regclass 
        AND NOT tgisinternal
    LOOP
        EXECUTE format('ALTER TABLE auction_rounds DISABLE TRIGGER %I', trigger_rec.tgname);
        RAISE NOTICE 'Disabled trigger % on auction_rounds table', trigger_rec.tgname;
    END LOOP;
    
    -- And for teams
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'teams'::regclass 
        AND NOT tgisinternal
    LOOP
        EXECUTE format('ALTER TABLE teams DISABLE TRIGGER %I', trigger_rec.tgname);
        RAISE NOTICE 'Disabled trigger % on teams table', trigger_rec.tgname;
    END LOOP;
END
$$;

-- Specifically try to disable known problematic triggers
ALTER TABLE players DISABLE TRIGGER IF EXISTS validate_combined_requirements;
ALTER TABLE players DISABLE TRIGGER IF EXISTS validate_team_requirements;
ALTER TABLE players DISABLE TRIGGER IF EXISTS update_players_updated_at;

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
    RAISE NOTICE 'EMERGENCY: User-defined validation triggers disabled for live auction';
    
    -- Check if migration_logs table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migration_logs'
    ) THEN
        INSERT INTO migration_logs (migration_name, description, executed_at)
        VALUES (
            '20240602000003_disable_user_triggers',
            'EMERGENCY: Disabled user-defined validation triggers for live auction',
            NOW()
        )
        ON CONFLICT (migration_name) DO NOTHING;
    END IF;
END
$$; 