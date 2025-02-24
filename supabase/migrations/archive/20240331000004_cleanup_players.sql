-- Function to clean up players that were created from registrations
CREATE OR REPLACE FUNCTION cleanup_players_from_registrations()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete players that exist in tournament_registrations
    WITH deleted_players AS (
        DELETE FROM players p
        WHERE EXISTS (
            SELECT 1 
            FROM tournament_registrations tr 
            WHERE tr.id = p.id
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_players;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_players_from_registrations TO authenticated;

-- Example usage:
-- SELECT cleanup_players_from_registrations();

-- Rollback SQL
/*
DROP FUNCTION IF EXISTS cleanup_players_from_registrations;
*/ 