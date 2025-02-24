-- Function to calculate preferred players budget analysis
CREATE OR REPLACE FUNCTION get_preferred_players_budget_analysis(p_team_id UUID)
RETURNS TABLE (
    total_max_bids INTEGER,
    team_budget INTEGER,
    budget_difference INTEGER,
    budget_utilization_percentage NUMERIC,
    preferred_players_count INTEGER,
    average_max_bid NUMERIC,
    budget_status TEXT,
    category_breakdown JSON
) AS $$
DECLARE
    v_team_budget INTEGER;
    v_total_max_bids INTEGER;
BEGIN
    -- Get team's budget
    SELECT initial_budget INTO v_team_budget
    FROM teams
    WHERE id = p_team_id;

    -- Calculate total maximum bids for preferred players
    WITH preferred_totals AS (
        SELECT 
            pp.team_id,
            p.id as player_id,
            p.name as player_name,
            c.name as category_name,
            GREATEST(
                c.base_points,
                CASE p.skill_level
                    WHEN 'COMPETITIVE_A' THEN c.base_points * 1.2
                    WHEN 'UPPER_INTERMEDIATE_BB' THEN c.base_points * 1.1
                    WHEN 'INTERMEDIATE_B' THEN c.base_points
                    WHEN 'RECREATIONAL_C' THEN c.base_points * 0.9
                    ELSE c.base_points
                END
            )::INTEGER as max_bid
        FROM preferred_players pp
        JOIN players p ON p.id = pp.player_id
        JOIN player_categories pc ON pc.player_id = p.id
        JOIN categories c ON c.id = pc.category_id
        WHERE pp.team_id = p_team_id
        AND p.status = 'AVAILABLE'
    )
    SELECT 
        COALESCE(SUM(max_bid), 0)::INTEGER,
        COUNT(*)::INTEGER,
        COALESCE(AVG(max_bid), 0)::NUMERIC,
        jsonb_object_agg(
            category_name,
            jsonb_build_object(
                'count', COUNT(*),
                'total_max_bid', SUM(max_bid)
            )
        )::JSON
    INTO 
        v_total_max_bids,
        preferred_players_count,
        average_max_bid,
        category_breakdown
    FROM preferred_totals;

    -- Calculate budget metrics
    total_max_bids := v_total_max_bids;
    team_budget := v_team_budget;
    budget_difference := v_team_budget - v_total_max_bids;
    budget_utilization_percentage := ROUND((v_total_max_bids::NUMERIC / NULLIF(v_team_budget, 0) * 100)::NUMERIC, 2);
    
    -- Determine budget status
    budget_status := CASE
        WHEN v_total_max_bids = 0 THEN 'NO_PREFERRED_PLAYERS'
        WHEN v_total_max_bids > v_team_budget THEN 'OVER_BUDGET'
        WHEN v_total_max_bids >= v_team_budget * 0.9 THEN 'NEAR_LIMIT'
        WHEN v_total_max_bids >= v_team_budget * 0.75 THEN 'APPROACHING_LIMIT'
        ELSE 'WITHIN_BUDGET'
    END;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Create preferred_players table if it doesn't exist
CREATE TABLE IF NOT EXISTS preferred_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, player_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_preferred_players_team ON preferred_players(team_id);
CREATE INDEX IF NOT EXISTS idx_preferred_players_player ON preferred_players(player_id);
CREATE INDEX IF NOT EXISTS idx_preferred_players_composite ON preferred_players(team_id, player_id);

-- Enable RLS
ALTER TABLE preferred_players ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON preferred_players TO authenticated;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON preferred_players
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable write access for authenticated users" ON preferred_players
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Example usage:
-- SELECT * FROM get_preferred_players_budget_analysis('team-uuid-here');

-- Rollback SQL
/*
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON preferred_players;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON preferred_players;
DROP INDEX IF EXISTS idx_preferred_players_composite;
DROP INDEX IF EXISTS idx_preferred_players_player;
DROP INDEX IF EXISTS idx_preferred_players_team;
DROP TABLE IF EXISTS preferred_players;
DROP FUNCTION IF EXISTS get_preferred_players_budget_analysis;
*/ 