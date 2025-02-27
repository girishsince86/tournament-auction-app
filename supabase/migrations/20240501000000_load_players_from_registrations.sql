-- Migration: Load Players from Registrations with Enhanced Functionality
-- This migration provides functions to:
-- 1. Load players from tournament registrations with more flexibility
-- 2. Clean up players that were created from registrations
-- 3. Update existing players from registrations

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS load_players_from_registrations(TEXT, UUID, BOOLEAN);
DROP FUNCTION IF EXISTS cleanup_players_from_registrations(TEXT);
DROP FUNCTION IF EXISTS get_registration_statistics();

-- Function to load players from registrations with more flexibility
CREATE OR REPLACE FUNCTION load_players_from_registrations(
    p_registration_category TEXT DEFAULT NULL,
    p_tournament_id UUID DEFAULT NULL,
    p_update_existing BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    players_added INTEGER,
    players_updated INTEGER,
    players_skipped INTEGER
) AS $$
DECLARE
    v_players_added INTEGER := 0;
    v_players_updated INTEGER := 0;
    v_players_skipped INTEGER := 0;
    v_category_filter TEXT;
    v_tournament_id UUID;
BEGIN
    -- Set default tournament if not provided
    IF p_tournament_id IS NULL THEN
        SELECT id INTO v_tournament_id FROM tournaments ORDER BY created_at DESC LIMIT 1;
    ELSE
        v_tournament_id := p_tournament_id;
    END IF;

    -- Set category filter
    IF p_registration_category IS NULL THEN
        v_category_filter := 'VOLLEYBALL%'; -- Only load volleyball players by default
    ELSE
        v_category_filter := p_registration_category;
    END IF;

    -- Insert new players from verified registrations that don't already exist
    WITH new_players AS (
        INSERT INTO players (
            id,
            name,
            player_position,
            base_price,
            phone_number,
            apartment_number,
            jersey_number,
            skill_level,
            height,
            status,
            tshirt_size,
            profile_image_url,
            registration_data,
            tournament_id,
            created_at,
            updated_at
        )
        SELECT 
            tr.id,
            CONCAT(tr.first_name, ' ', tr.last_name) as name,
            -- Take the first preferred position from the array, default to SETTER if none
            COALESCE(
                tr.playing_positions[1], 
                'SETTER'
            )::player_position as player_position,
            COALESCE(
                CASE tr.skill_level
                    WHEN 'RECREATIONAL_C' THEN 100
                    WHEN 'INTERMEDIATE_B' THEN 150
                    WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
                    WHEN 'COMPETITIVE_A' THEN 250
                    ELSE 100
                END,
                100
            ) as base_price,
            tr.phone_number,
            tr.flat_number as apartment_number,
            tr.tshirt_number as jersey_number,
            tr.skill_level::skill_level,
            tr.height::integer,
            'AVAILABLE'::player_status as status,
            tr.tshirt_size,
            tr.profile_image_url,
            jsonb_build_object(
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
            ) as registration_data,
            v_tournament_id,
            tr.created_at,
            tr.updated_at
        FROM tournament_registrations tr
        WHERE tr.is_verified = true
        AND tr.registration_category LIKE v_category_filter
        AND tr.registration_category LIKE 'VOLLEYBALL%' -- Only load volleyball players
        AND NOT EXISTS (
            SELECT 1 
            FROM players p 
            WHERE p.id = tr.id
        )
        RETURNING id
    )
    SELECT 
        COUNT(*) INTO v_players_added 
    FROM new_players;

    -- Update existing players if requested
    IF p_update_existing THEN
        WITH updated_players AS (
            UPDATE players p
            SET 
                name = CONCAT(tr.first_name, ' ', tr.last_name),
                player_position = COALESCE(tr.playing_positions[1], 'SETTER')::player_position,
                phone_number = tr.phone_number,
                apartment_number = tr.flat_number,
                jersey_number = tr.tshirt_number,
                skill_level = tr.skill_level::skill_level,
                height = tr.height::integer,
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
                tournament_id = v_tournament_id,
                updated_at = now()
            FROM tournament_registrations tr
            WHERE p.id = tr.id
            AND tr.is_verified = true
            AND tr.registration_category LIKE v_category_filter
            AND tr.registration_category LIKE 'VOLLEYBALL%' -- Only update volleyball players
            RETURNING p.id
        )
        SELECT 
            COUNT(*) INTO v_players_updated 
        FROM updated_players;
    END IF;

    -- Count skipped players (already exist and not updated)
    SELECT 
        COUNT(*) INTO v_players_skipped
    FROM tournament_registrations tr
    WHERE tr.is_verified = true
        AND tr.registration_category LIKE v_category_filter
        AND tr.registration_category LIKE 'VOLLEYBALL%' -- Only count volleyball players
        AND EXISTS (
            SELECT 1 
            FROM players p 
            WHERE p.id = tr.id
        )
        AND (NOT p_update_existing);

    RETURN QUERY SELECT v_players_added, v_players_updated, v_players_skipped;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up players that were created from registrations
-- with optional filtering by registration category
CREATE OR REPLACE FUNCTION cleanup_players_from_registrations(
    p_registration_category TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
    v_category_filter TEXT;
BEGIN
    -- Set category filter
    IF p_registration_category IS NULL THEN
        v_category_filter := 'VOLLEYBALL%'; -- Only clean up volleyball players by default
    ELSE
        v_category_filter := p_registration_category;
    END IF;

    -- Delete players that exist in tournament_registrations with matching category
    WITH deleted_players AS (
        DELETE FROM players p
        WHERE EXISTS (
            SELECT 1 
            FROM tournament_registrations tr 
            WHERE tr.id = p.id
            AND tr.registration_category LIKE v_category_filter
            AND tr.registration_category LIKE 'VOLLEYBALL%' -- Only clean up volleyball players
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_players;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get registration statistics
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
        WHERE registration_category LIKE 'VOLLEYBALL%' -- Only show volleyball registrations
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
GRANT EXECUTE ON FUNCTION load_players_from_registrations(TEXT, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_players_from_registrations(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_registration_statistics() TO authenticated;

-- Example usage:
-- SELECT * FROM load_players_from_registrations();
-- SELECT * FROM load_players_from_registrations('VOLLEYBALL_OPEN_MEN');
-- SELECT * FROM load_players_from_registrations('VOLLEYBALL_OPEN_MEN', NULL, TRUE);
-- SELECT * FROM cleanup_players_from_registrations();
-- SELECT * FROM cleanup_players_from_registrations('VOLLEYBALL_OPEN_MEN');
-- SELECT * FROM get_registration_statistics();

-- Rollback SQL
/*
DROP FUNCTION IF EXISTS load_players_from_registrations(TEXT, UUID, BOOLEAN);
DROP FUNCTION IF EXISTS cleanup_players_from_registrations(TEXT);
DROP FUNCTION IF EXISTS get_registration_statistics();
*/ 