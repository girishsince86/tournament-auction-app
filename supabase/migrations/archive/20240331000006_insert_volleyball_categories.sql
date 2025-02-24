-- Function to insert volleyball categories and link players
CREATE OR REPLACE FUNCTION setup_volleyball_categories(p_tournament_id UUID)
RETURNS TABLE (
    category_name TEXT,
    players_linked INTEGER
) AS $$
DECLARE
    v_right_back_id UUID;
    v_right_front_id UUID;
    v_middle_front_id UUID;
    v_left_front_id UUID;
    v_left_back_id UUID;
    v_middle_back_id UUID;
    v_count1 INTEGER := 0;
    v_count2 INTEGER := 0;
    v_count3 INTEGER := 0;
    v_count4 INTEGER := 0;
    v_count5 INTEGER := 0;
    v_count6 INTEGER := 0;
BEGIN
    -- Insert Right Back (P1) Category - Defensive Specialist
    INSERT INTO categories (
        tournament_id,
        name,
        category_type,
        base_points,
        min_points,
        max_points,
        description,
        skill_level,
        created_at,
        updated_at
    )
    VALUES (
        p_tournament_id,
        'Defensive Specialist (P1)',
        'LEVEL_1',
        200,
        100,
        400,
        'Right Back (P1) - Defensive specialist responsible for back row defense and serve receive',
        'COMPETITIVE_A',
        NOW(),
        NOW()
    )
    ON CONFLICT (tournament_id, name) DO UPDATE 
    SET updated_at = NOW()
    RETURNING id INTO v_right_back_id;

    -- Insert Right Front (P2) Category - Blocker
    INSERT INTO categories (
        tournament_id,
        name,
        category_type,
        base_points,
        min_points,
        max_points,
        description,
        skill_level,
        created_at,
        updated_at
    )
    VALUES (
        p_tournament_id,
        'Blocker (P2)',
        'LEVEL_1',
        200,
        100,
        400,
        'Right Front (P2) - Blocker specializing in quick attacks and blocking',
        'COMPETITIVE_A',
        NOW(),
        NOW()
    )
    ON CONFLICT (tournament_id, name) DO UPDATE 
    SET updated_at = NOW()
    RETURNING id INTO v_right_front_id;

    -- Insert Middle Front (P3) Category - Setter
    INSERT INTO categories (
        tournament_id,
        name,
        category_type,
        base_points,
        min_points,
        max_points,
        description,
        skill_level,
        created_at,
        updated_at
    )
    VALUES (
        p_tournament_id,
        'Setter (P3)',
        'LEVEL_1',
        200,
        100,
        400,
        'Middle Front (P3) - Primary setter, orchestrates the offense and sets up attacks',
        'COMPETITIVE_A',
        NOW(),
        NOW()
    )
    ON CONFLICT (tournament_id, name) DO UPDATE 
    SET updated_at = NOW()
    RETURNING id INTO v_middle_front_id;

    -- Insert Left Front (P4) Category - Hitter
    INSERT INTO categories (
        tournament_id,
        name,
        category_type,
        base_points,
        min_points,
        max_points,
        description,
        skill_level,
        created_at,
        updated_at
    )
    VALUES (
        p_tournament_id,
        'Hitter (P4)',
        'LEVEL_1',
        200,
        100,
        400,
        'Left Front (P4) - Primary attacking position, responsible for offense and scoring',
        'COMPETITIVE_A',
        NOW(),
        NOW()
    )
    ON CONFLICT (tournament_id, name) DO UPDATE 
    SET updated_at = NOW()
    RETURNING id INTO v_left_front_id;

    -- Insert Left Back (P5) Category - Back Row Attacker
    INSERT INTO categories (
        tournament_id,
        name,
        category_type,
        base_points,
        min_points,
        max_points,
        description,
        skill_level,
        created_at,
        updated_at
    )
    VALUES (
        p_tournament_id,
        'Back Row Attacker (P5)',
        'LEVEL_1',
        200,
        100,
        400,
        'Left Back (P5) - Back row attacker and defensive specialist, handles serve receive and back row attacks',
        'COMPETITIVE_A',
        NOW(),
        NOW()
    )
    ON CONFLICT (tournament_id, name) DO UPDATE 
    SET updated_at = NOW()
    RETURNING id INTO v_left_back_id;

    -- Insert Middle Back (P6) Category - Center
    INSERT INTO categories (
        tournament_id,
        name,
        category_type,
        base_points,
        min_points,
        max_points,
        description,
        skill_level,
        created_at,
        updated_at
    )
    VALUES (
        p_tournament_id,
        'Center (P6)',
        'LEVEL_1',
        200,
        100,
        400,
        'Middle Back (P6) - Center position, controls middle court defense and distribution',
        'COMPETITIVE_A',
        NOW(),
        NOW()
    )
    ON CONFLICT (tournament_id, name) DO UPDATE 
    SET updated_at = NOW()
    RETURNING id INTO v_middle_back_id;

    -- Link players to categories based on their primary playing position
    WITH new_links AS (
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
            CASE p.player_position
                WHEN 'P1_RIGHT_BACK' THEN v_right_back_id
                WHEN 'P2_RIGHT_FRONT' THEN v_right_front_id
                WHEN 'P3_MIDDLE_FRONT' THEN v_middle_front_id
                WHEN 'P4_LEFT_FRONT' THEN v_left_front_id
                WHEN 'P5_LEFT_BACK' THEN v_left_back_id
                WHEN 'P6_MIDDLE_BACK' THEN v_middle_back_id
            END,
            NOW(),
            NOW()
        FROM tournament_registrations tr
        JOIN players p ON p.id = tr.id
        WHERE tr.registration_category = 'VOLLEYBALL_OPEN_MEN'
        AND tr.is_verified = true
        AND NOT EXISTS (
            SELECT 1 
            FROM player_categories pc 
            WHERE pc.player_id = p.id 
            AND pc.tournament_id = p_tournament_id
        )
        RETURNING category_id
    )
    SELECT 
        COUNT(*) FILTER (WHERE category_id = v_right_back_id),
        COUNT(*) FILTER (WHERE category_id = v_right_front_id),
        COUNT(*) FILTER (WHERE category_id = v_middle_front_id),
        COUNT(*) FILTER (WHERE category_id = v_left_front_id),
        COUNT(*) FILTER (WHERE category_id = v_left_back_id),
        COUNT(*) FILTER (WHERE category_id = v_middle_back_id)
    INTO v_count1, v_count2, v_count3, v_count4, v_count5, v_count6
    FROM new_links;

    RETURN QUERY
    SELECT 'Defensive Specialist (P1)'::TEXT, v_count1
    UNION ALL SELECT 'Blocker (P2)', v_count2
    UNION ALL SELECT 'Setter (P3)', v_count3
    UNION ALL SELECT 'Hitter (P4)', v_count4
    UNION ALL SELECT 'Back Row Attacker (P5)', v_count5
    UNION ALL SELECT 'Center (P6)', v_count6;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION setup_volleyball_categories TO authenticated;

-- Example usage:
-- SELECT * FROM setup_volleyball_categories('11111111-1111-1111-1111-111111111111');

-- Rollback SQL
/*
DROP FUNCTION IF EXISTS setup_volleyball_categories;
*/ 