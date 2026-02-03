-- Script to manage volleyball players
-- This script provides functions to:
-- 1. Update existing players from volleyball registrations
-- 2. Clean up players that were created from volleyball registrations

-- Function to update existing players from volleyball registrations
CREATE OR REPLACE FUNCTION update_players_from_volleyball_registrations(
    p_team_id UUID DEFAULT NULL
)
RETURNS TABLE (
    players_updated INTEGER
) AS $$
DECLARE
    v_players_updated INTEGER := 0;
    v_team_id UUID;
BEGIN
    -- Set default team if not provided
    IF p_team_id IS NULL THEN
        SELECT id INTO v_team_id FROM teams ORDER BY created_at DESC LIMIT 1;
    ELSE
        v_team_id := p_team_id;
    END IF;

    -- Update existing players from volleyball registrations
    WITH updated_players AS (
        UPDATE players p
        SET 
            name = CONCAT(tr.first_name, ' ', tr.last_name),
            player_position = COALESCE(tr.playing_positions[1], 'ANY_POSITION')::player_position,
            base_price = COALESCE(
                CASE tr.skill_level
                    WHEN 'RECREATIONAL_C' THEN 100
                    WHEN 'INTERMEDIATE_B' THEN 150
                    WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
                    WHEN 'COMPETITIVE_A' THEN 250
                    ELSE 100
                END,
                100
            ),
            phone_number = tr.phone_number,
            apartment_number = tr.flat_number,
            jersey_number = tr.tshirt_number,
            skill_level = tr.skill_level::skill_level,
            height = tr.height::integer,
            status = 'AVAILABLE'::player_status, -- Set status to AVAILABLE
            tshirt_size = tr.tshirt_size,
            profile_image_url = tr.profile_image_url,
            registration_data = jsonb_build_object(
                'registration_category', tr.registration_category,
                'registration_type', tr.registration_type,
                'all_positions', tr.playing_positions,
                'email', tr.email,
                'date_of_birth', tr.date_of_birth,
                'parent_name', tr.parent_name,
                'parent_phone_number', tr.parent_phone_number,
                'tshirt_name', tr.tshirt_name,
                'verification_info', jsonb_build_object(
                    'verified_by', tr.verified_by,
                    'verified_at', tr.verified_at,
                    'verification_notes', tr.verification_notes
                ),
                'payment_info', jsonb_build_object(
                    'upi_id', tr.payment_upi_id,
                    'transaction_id', tr.payment_transaction_id,
                    'paid_to', tr.paid_to,
                    'amount_received', tr.amount_received
                )
            ),
            current_team_id = v_team_id,
            updated_at = now()
        FROM tournament_registrations tr
        WHERE p.id = tr.id
        AND tr.registration_category::text LIKE 'VOLLEYBALL%' -- Only update volleyball players
        RETURNING p.id
    )
    SELECT 
        COUNT(*) INTO v_players_updated 
    FROM updated_players;

    RETURN QUERY SELECT v_players_updated;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up players that were created from volleyball registrations
CREATE OR REPLACE FUNCTION cleanup_volleyball_players()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete players that exist in tournament_registrations with volleyball category
    WITH deleted_players AS (
        DELETE FROM players p
        WHERE EXISTS (
            SELECT 1 
            FROM tournament_registrations tr 
            WHERE tr.id = p.id
            AND tr.registration_category LIKE 'VOLLEYBALL%'
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_players;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get detailed statistics about volleyball players
CREATE OR REPLACE FUNCTION get_volleyball_players_statistics()
RETURNS TABLE (
    skill_level TEXT,
    total_registrations INTEGER,
    players_created INTEGER,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH registration_stats AS (
        SELECT 
            skill_level::TEXT,
            COUNT(*) as total_registrations
        FROM tournament_registrations
        WHERE registration_category LIKE 'VOLLEYBALL%'
        GROUP BY skill_level
    ),
    player_stats AS (
        SELECT 
            p.skill_level::TEXT,
            COUNT(*) as players_created
        FROM players p
        JOIN tournament_registrations tr ON p.id = tr.id
        WHERE tr.registration_category LIKE 'VOLLEYBALL%'
        GROUP BY p.skill_level
    )
    SELECT 
        rs.skill_level,
        rs.total_registrations,
        COALESCE(ps.players_created, 0) as players_created,
        CASE 
            WHEN rs.total_registrations > 0 
            THEN ROUND((COALESCE(ps.players_created, 0)::NUMERIC / rs.total_registrations) * 100, 2)
            ELSE 0
        END as percentage
    FROM registration_stats rs
    LEFT JOIN player_stats ps ON rs.skill_level = ps.skill_level
    ORDER BY rs.skill_level;
END;
$$ LANGUAGE plpgsql; 