-- Create function to get tournament budget statistics
CREATE OR REPLACE FUNCTION get_tournament_budget_stats(p_tournament_id UUID)
RETURNS TABLE (
    avg_team_size INTEGER,
    avg_player_cost NUMERIC,
    max_player_cost INTEGER,
    min_player_cost INTEGER,
    total_teams INTEGER,
    total_players INTEGER,
    avg_budget_utilization NUMERIC,
    highest_budget_utilization NUMERIC,
    lowest_budget_utilization NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH team_stats AS (
        SELECT 
            t.id AS team_id,
            t.initial_budget,
            COUNT(p.id) AS player_count,
            COALESCE(SUM(COALESCE(ar.final_points, p.base_price)), 0) AS total_spent
        FROM teams t
        LEFT JOIN players p ON p.current_team_id = t.id
        LEFT JOIN auction_rounds ar ON ar.player_id = p.id
        WHERE t.tournament_id = p_tournament_id
        GROUP BY t.id, t.initial_budget
    )
    SELECT 
        COALESCE(ROUND(AVG(player_count))::INTEGER, 0) AS avg_team_size,
        COALESCE(ROUND(SUM(total_spent)::NUMERIC / NULLIF(SUM(player_count), 0), 2), 0) AS avg_player_cost,
        COALESCE((
            SELECT MAX(COALESCE(ar.final_points, p.base_price))
            FROM players p
            LEFT JOIN auction_rounds ar ON ar.player_id = p.id
            WHERE p.tournament_id = p_tournament_id
        ), 0) AS max_player_cost,
        COALESCE((
            SELECT MIN(COALESCE(ar.final_points, p.base_price))
            FROM players p
            LEFT JOIN auction_rounds ar ON ar.player_id = p.id
            WHERE p.tournament_id = p_tournament_id
            AND p.current_team_id IS NOT NULL
        ), 0) AS min_player_cost,
        COUNT(*)::INTEGER AS total_teams,
        COALESCE(SUM(player_count)::INTEGER, 0) AS total_players,
        COALESCE(ROUND(AVG(total_spent::NUMERIC / NULLIF(initial_budget, 0) * 100), 2), 0) AS avg_budget_utilization,
        COALESCE(ROUND(MAX(total_spent::NUMERIC / NULLIF(initial_budget, 0) * 100), 2), 0) AS highest_budget_utilization,
        COALESCE(ROUND(MIN(total_spent::NUMERIC / NULLIF(initial_budget, 0) * 100), 2), 0) AS lowest_budget_utilization
    FROM team_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_tournament_budget_stats TO authenticated;

-- Rollback SQL
/*
DROP FUNCTION IF EXISTS get_tournament_budget_stats;
*/ 