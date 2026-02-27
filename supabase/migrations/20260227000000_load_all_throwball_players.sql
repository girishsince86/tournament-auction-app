-- Load ALL throwball players into the players table:
--   TB Women: LEFT JOIN auction_consent (includes all 43, not just AUCTION_POOL)
--   TB 8-12 Mixed: all 39 verified registrations
--   TB 13-17 Mixed: all 35 verified registrations

DROP FUNCTION IF EXISTS load_all_throwball_players(UUID, BOOLEAN);

CREATE OR REPLACE FUNCTION load_all_throwball_players(
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
    v_added INTEGER;
    v_updated INTEGER;
BEGIN
    -- Set default tournament if not provided
    IF p_tournament_id IS NULL THEN
        SELECT id INTO v_tournament_id FROM tournaments ORDER BY created_at DESC LIMIT 1;
    ELSE
        v_tournament_id := p_tournament_id;
    END IF;

    -- ============================================================
    -- THROWBALL_WOMEN: all verified registrations (LEFT JOIN consent)
    -- ============================================================
    WITH new_tb_women AS (
        INSERT INTO players (
            id, name, player_position, base_price, phone_number,
            apartment_number, jersey_number, skill_level, height,
            status, tshirt_size, profile_image_url, registration_data,
            tournament_id, sport_category, created_at, updated_at
        )
        SELECT
            tr.id,
            CONCAT(tr.first_name, ' ', tr.last_name),
            'ANY_POSITION'::player_position,
            COALESCE(
                CASE tr.skill_level
                    WHEN 'RECREATIONAL_C' THEN 100
                    WHEN 'INTERMEDIATE_B' THEN 150
                    WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
                    WHEN 'COMPETITIVE_A' THEN 250
                    ELSE 100
                END, 100
            ),
            tr.phone_number,
            tr.flat_number,
            tr.tshirt_number,
            tr.skill_level::skill_level,
            tr.height::integer,
            'AVAILABLE'::player_status,
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
            ),
            v_tournament_id,
            'THROWBALL_WOMEN',
            tr.created_at,
            tr.updated_at
        FROM tournament_registrations tr
        LEFT JOIN auction_consent ac ON ac.registration_id = tr.id
        WHERE tr.is_verified = true
          AND tr.registration_category = 'THROWBALL_WOMEN'
          AND NOT EXISTS (SELECT 1 FROM players p WHERE p.id = tr.id)
        RETURNING id
    )
    SELECT COUNT(*) INTO v_added FROM new_tb_women;
    v_players_added := v_players_added + v_added;

    -- Update existing TB Women players to include consent_choice
    IF p_update_existing THEN
        WITH updated_tb_women AS (
            UPDATE players p
            SET
                registration_data = p.registration_data || jsonb_build_object(
                    'consent_choice', ac.consent_choice
                ),
                updated_at = now()
            FROM tournament_registrations tr
            LEFT JOIN auction_consent ac ON ac.registration_id = tr.id
            WHERE p.id = tr.id
              AND tr.is_verified = true
              AND tr.registration_category = 'THROWBALL_WOMEN'
              AND p.sport_category = 'THROWBALL_WOMEN'
            RETURNING p.id
        )
        SELECT COUNT(*) INTO v_updated FROM updated_tb_women;
        v_players_updated := v_players_updated + v_updated;
    END IF;

    -- ============================================================
    -- THROWBALL_13_17_MIXED: all verified registrations (no consent)
    -- ============================================================
    WITH new_tb_13_17 AS (
        INSERT INTO players (
            id, name, player_position, base_price, phone_number,
            apartment_number, jersey_number, skill_level, height,
            status, tshirt_size, profile_image_url, registration_data,
            tournament_id, sport_category, created_at, updated_at
        )
        SELECT
            tr.id,
            CONCAT(tr.first_name, ' ', tr.last_name),
            'ANY_POSITION'::player_position,
            COALESCE(
                CASE tr.skill_level
                    WHEN 'RECREATIONAL_C' THEN 100
                    WHEN 'INTERMEDIATE_B' THEN 150
                    WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
                    WHEN 'COMPETITIVE_A' THEN 250
                    ELSE 100
                END, 100
            ),
            tr.phone_number,
            tr.flat_number,
            tr.tshirt_number,
            tr.skill_level::skill_level,
            tr.height::integer,
            'AVAILABLE'::player_status,
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
            v_tournament_id,
            'THROWBALL_13_17_MIXED',
            tr.created_at,
            tr.updated_at
        FROM tournament_registrations tr
        WHERE tr.is_verified = true
          AND tr.registration_category = 'THROWBALL_13_17_MIXED'
          AND NOT EXISTS (SELECT 1 FROM players p WHERE p.id = tr.id)
        RETURNING id
    )
    SELECT COUNT(*) INTO v_added FROM new_tb_13_17;
    v_players_added := v_players_added + v_added;

    -- ============================================================
    -- THROWBALL_8_12_MIXED: all verified registrations (no consent)
    -- ============================================================
    WITH new_tb_8_12 AS (
        INSERT INTO players (
            id, name, player_position, base_price, phone_number,
            apartment_number, jersey_number, skill_level, height,
            status, tshirt_size, profile_image_url, registration_data,
            tournament_id, sport_category, created_at, updated_at
        )
        SELECT
            tr.id,
            CONCAT(tr.first_name, ' ', tr.last_name),
            'ANY_POSITION'::player_position,
            COALESCE(
                CASE tr.skill_level
                    WHEN 'RECREATIONAL_C' THEN 100
                    WHEN 'INTERMEDIATE_B' THEN 150
                    WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
                    WHEN 'COMPETITIVE_A' THEN 250
                    ELSE 100
                END, 100
            ),
            tr.phone_number,
            tr.flat_number,
            tr.tshirt_number,
            tr.skill_level::skill_level,
            tr.height::integer,
            'AVAILABLE'::player_status,
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
            v_tournament_id,
            'THROWBALL_8_12_MIXED',
            tr.created_at,
            tr.updated_at
        FROM tournament_registrations tr
        WHERE tr.is_verified = true
          AND tr.registration_category = 'THROWBALL_8_12_MIXED'
          AND NOT EXISTS (SELECT 1 FROM players p WHERE p.id = tr.id)
        RETURNING id
    )
    SELECT COUNT(*) INTO v_added FROM new_tb_8_12;
    v_players_added := v_players_added + v_added;

    -- Count skipped players (already exist across all categories)
    SELECT COUNT(*) INTO v_players_skipped
    FROM tournament_registrations tr
    WHERE tr.is_verified = true
      AND tr.registration_category IN (
          'THROWBALL_WOMEN', 'THROWBALL_13_17_MIXED', 'THROWBALL_8_12_MIXED'
      )
      AND EXISTS (SELECT 1 FROM players p WHERE p.id = tr.id)
      AND (NOT p_update_existing);

    RETURN QUERY SELECT v_players_added, v_players_updated, v_players_skipped;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION load_all_throwball_players(UUID, BOOLEAN) TO authenticated;

-- Run the function to load players
SELECT * FROM load_all_throwball_players(NULL, TRUE);
