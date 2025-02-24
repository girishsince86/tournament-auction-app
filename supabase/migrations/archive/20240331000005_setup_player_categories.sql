-- Function to set up player categories for volleyball players
CREATE OR REPLACE FUNCTION setup_volleyball_player_categories(p_tournament_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_category_id UUID;
    v_count INTEGER;
BEGIN
    -- First, get or create the volleyball category for this tournament
    INSERT INTO categories (name, tournament_id, created_at, updated_at)
    VALUES ('Volleyball Open Men', p_tournament_id, NOW(), NOW())
    ON CONFLICT (name, tournament_id) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_category_id;

    -- Add player_categories entries for volleyball players
    WITH new_categories AS (
        INSERT INTO player_categories (
            player_id,
            tournament_id,
            category_id,
            created_at,
            updated_at
        )
        SELECT 
            p.id,
            p_tournament_id,
            v_category_id,
            NOW(),
            NOW()
        FROM players p
        JOIN tournament_registrations tr ON tr.id = p.id
        WHERE tr.registration_category = 'VOLLEYBALL_OPEN_MEN'
        AND NOT EXISTS (
            SELECT 1 
            FROM player_categories pc 
            WHERE pc.player_id = p.id 
            AND pc.tournament_id = p_tournament_id
        )
        RETURNING player_id
    )
    SELECT COUNT(*) INTO v_count FROM new_categories;

    -- Update players status to AVAILABLE
    UPDATE players p
    SET status = 'AVAILABLE'
    WHERE EXISTS (
        SELECT 1 
        FROM tournament_registrations tr 
        WHERE tr.id = p.id 
        AND tr.registration_category = 'VOLLEYBALL_OPEN_MEN'
    )
    AND status IS NULL;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION setup_volleyball_player_categories TO authenticated;

-- Example usage:
-- SELECT setup_volleyball_player_categories('11111111-1111-1111-1111-111111111111');

-- Rollback SQL
/*
DROP FUNCTION IF EXISTS setup_volleyball_player_categories;
*/ 