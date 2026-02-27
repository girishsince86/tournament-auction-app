-- Load THROWBALL_WOMEN players who have given AUCTION_POOL consent
-- into the players table for auction.

DROP FUNCTION IF EXISTS load_throwball_women_players(UUID, BOOLEAN);

CREATE OR REPLACE FUNCTION load_throwball_women_players(
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
    v_tournament_id UUID;
BEGIN
    -- Set default tournament if not provided
    IF p_tournament_id IS NULL THEN
        SELECT id INTO v_tournament_id FROM tournaments ORDER BY created_at DESC LIMIT 1;
    ELSE
        v_tournament_id := p_tournament_id;
    END IF;

    -- Insert new players from verified THROWBALL_WOMEN registrations
    -- who have given AUCTION_POOL consent
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
            sport_category,
            created_at,
            updated_at
        )
        SELECT
            tr.id,
            CONCAT(tr.first_name, ' ', tr.last_name) as name,
            'ANY_POSITION'::player_position as player_position,
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
            tr.tshirt_size::tshirt_size,
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
                'consent_choice', ac.consent_choice,
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
            'THROWBALL_WOMEN' as sport_category,
            tr.created_at,
            tr.updated_at
        FROM tournament_registrations tr
        INNER JOIN auction_consent ac
            ON ac.registration_id = tr.id
            AND ac.consent_choice = 'AUCTION_POOL'
        WHERE tr.is_verified = true
        AND tr.registration_category = 'THROWBALL_WOMEN'
        AND NOT EXISTS (
            SELECT 1
            FROM players p
            WHERE p.id = tr.id
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_players_added FROM new_players;

    -- Update existing players if requested
    IF p_update_existing THEN
        WITH updated_players AS (
            UPDATE players p
            SET
                name = CONCAT(tr.first_name, ' ', tr.last_name),
                player_position = 'ANY_POSITION'::player_position,
                phone_number = tr.phone_number,
                apartment_number = tr.flat_number,
                jersey_number = tr.tshirt_number,
                skill_level = tr.skill_level::skill_level,
                height = tr.height::integer,
                tshirt_size = tr.tshirt_size::tshirt_size,
                profile_image_url = tr.profile_image_url,
                sport_category = 'THROWBALL_WOMEN',
                registration_data = jsonb_build_object(
                    'registration_category', tr.registration_category,
                    'registration_type', tr.registration_type,
                    'all_positions', tr.playing_positions,
                    'email', tr.email,
                    'date_of_birth', tr.date_of_birth,
                    'parent_name', tr.parent_name,
                    'parent_phone_number', tr.parent_phone_number,
                    'tshirt_name', tr.tshirt_name,
                    'consent_choice', ac.consent_choice,
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
            INNER JOIN auction_consent ac
                ON ac.registration_id = tr.id
                AND ac.consent_choice = 'AUCTION_POOL'
            WHERE p.id = tr.id
            AND tr.is_verified = true
            AND tr.registration_category = 'THROWBALL_WOMEN'
            RETURNING p.id
        )
        SELECT COUNT(*) INTO v_players_updated FROM updated_players;
    END IF;

    -- Count skipped players (already exist and not updated)
    SELECT COUNT(*) INTO v_players_skipped
    FROM tournament_registrations tr
    INNER JOIN auction_consent ac
        ON ac.registration_id = tr.id
        AND ac.consent_choice = 'AUCTION_POOL'
    WHERE tr.is_verified = true
        AND tr.registration_category = 'THROWBALL_WOMEN'
        AND EXISTS (
            SELECT 1 FROM players p WHERE p.id = tr.id
        )
        AND (NOT p_update_existing);

    RETURN QUERY SELECT v_players_added, v_players_updated, v_players_skipped;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION load_throwball_women_players(UUID, BOOLEAN) TO authenticated;
