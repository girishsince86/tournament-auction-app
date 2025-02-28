-- Drop the existing function
DROP FUNCTION IF EXISTS get_registration_statistics();

-- Recreate the function with proper type casting for enum types
CREATE OR REPLACE FUNCTION get_registration_statistics()
RETURNS TABLE (
    category TEXT,
    total_registrations INTEGER,
    verified_registrations INTEGER,
    players_created INTEGER,
    verification_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH registration_stats AS (
        SELECT 
            registration_category::TEXT as category,
            COUNT(*)::INTEGER as total_registrations,
            SUM(CASE WHEN is_verified THEN 1 ELSE 0 END)::INTEGER as verified_registrations
        FROM tournament_registrations
        WHERE registration_category::TEXT LIKE 'VOLLEYBALL%' -- Cast enum to TEXT before using LIKE
        GROUP BY registration_category
    ),
    player_stats AS (
        SELECT 
            (registration_data->>'registration_category')::TEXT as category,
            COUNT(*)::INTEGER as players_created
        FROM players
        WHERE registration_data IS NOT NULL
        AND (registration_data->>'registration_category') LIKE 'VOLLEYBALL%' -- Only count volleyball players
        GROUP BY registration_data->>'registration_category'
    )
    SELECT 
        rs.category,
        rs.total_registrations,
        rs.verified_registrations,
        COALESCE(ps.players_created, 0) as players_created,
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

-- Test the function
SELECT * FROM get_registration_statistics(); 