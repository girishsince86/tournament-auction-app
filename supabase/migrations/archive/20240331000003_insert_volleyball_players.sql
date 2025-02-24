-- Function to insert volleyball players from registrations
CREATE OR REPLACE FUNCTION insert_volleyball_players_from_registrations()
RETURNS TABLE (
    players_added INTEGER,
    players_skipped INTEGER
) AS $$
DECLARE
    v_players_added INTEGER := 0;
    v_players_skipped INTEGER := 0;
BEGIN
    -- Insert players from verified registrations that don't already exist
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
            created_at,
            updated_at
        )
        SELECT 
            tr.id,
            CONCAT(tr.first_name, ' ', tr.last_name) as name,
            -- Take the first preferred position from the array, default to P4_LEFT_FRONT if none
            COALESCE(
                tr.playing_positions[1], 
                'P4_LEFT_FRONT'
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
            tr.height,
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
                'last_played_date', tr.last_played_date,
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
            tr.created_at,
            tr.updated_at
        FROM tournament_registrations tr
        WHERE tr.is_verified = true
        AND tr.registration_category = 'VOLLEYBALL_OPEN_MEN'
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

    -- Count skipped players (already exist)
    SELECT 
        COUNT(*) INTO v_players_skipped
    FROM tournament_registrations tr
    WHERE tr.is_verified = true
        AND tr.registration_category = 'VOLLEYBALL_OPEN_MEN'
        AND EXISTS (
            SELECT 1 
            FROM players p 
            WHERE p.id = tr.id
        );

    RETURN QUERY SELECT v_players_added, v_players_skipped;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_volleyball_players_from_registrations TO authenticated;

-- Example usage:
-- SELECT * FROM insert_volleyball_players_from_registrations();

-- Rollback SQL
/*
DROP FUNCTION IF EXISTS insert_volleyball_players_from_registrations;
*/ 