-- Drop the existing function
DROP FUNCTION IF EXISTS get_registration_statistics();

-- Recreate the function with correct return types
CREATE OR REPLACE FUNCTION get_registration_statistics()
RETURNS TABLE (
    category TEXT,
    total_registrations INTEGER,  -- Changed from BIGINT to INTEGER
    verified_registrations INTEGER,  -- Changed from BIGINT to INTEGER
    players_created INTEGER,  -- Changed from BIGINT to INTEGER
    verification_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH registration_stats AS (
        SELECT 
            registration_data->>'registration_category' as category,
            COUNT(*) as total_registrations,
            COUNT(*) FILTER (WHERE is_verified = true) as verified_registrations
        FROM registrations
        WHERE registration_data IS NOT NULL
        AND (registration_data->>'registration_category') LIKE 'VOLLEYBALL%' -- Only count volleyball players
        GROUP BY registration_data->>'registration_category'
    ),
    player_stats AS (
        SELECT 
            registration_data->>'registration_category' as category,
            COUNT(*) as players_created
        FROM players
        WHERE registration_data IS NOT NULL
        AND (registration_data->>'registration_category') LIKE 'VOLLEYBALL%' -- Only count volleyball players
        GROUP BY registration_data->>'registration_category'
    )
    SELECT 
        rs.category,
        rs.total_registrations::INTEGER,  -- Explicit cast to INTEGER
        rs.verified_registrations::INTEGER,  -- Explicit cast to INTEGER
        COALESCE(ps.players_created, 0)::INTEGER,  -- Explicit cast to INTEGER
        CASE 
            WHEN rs.total_registrations > 0 
            THEN ROUND((rs.verified_registrations::NUMERIC / rs.total_registrations) * 100, 2)
            ELSE 0
        END as verification_percentage
    FROM registration_stats rs
    LEFT JOIN player_stats ps ON rs.category = ps.category
    ORDER BY rs.category;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_registration_statistics() TO authenticated; 