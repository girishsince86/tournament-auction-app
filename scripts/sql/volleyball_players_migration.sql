-- Comprehensive script for migrating volleyball registrations to players
-- This script provides a complete solution for:
-- 1. Copying volleyball registrations to the Players table
-- 2. Updating existing players from volleyball registrations
-- 3. Cleaning up players that were created from volleyball registrations
-- 4. Generating statistics about the migration

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS copy_volleyball_registrations_to_players(UUID);
DROP FUNCTION IF EXISTS update_players_from_volleyball_registrations(UUID);
DROP FUNCTION IF EXISTS cleanup_volleyball_players();
DROP FUNCTION IF EXISTS get_volleyball_players_statistics();
DROP FUNCTION IF EXISTS execute_volleyball_players_migration(UUID, BOOLEAN, BOOLEAN);

-- Function to copy volleyball registrations to players table
CREATE OR REPLACE FUNCTION copy_volleyball_registrations_to_players(
    p_team_id UUID DEFAULT NULL
)
RETURNS TABLE (
    players_added INTEGER
) AS $$
DECLARE
    v_players_added INTEGER := 0;
    v_team_id UUID;
BEGIN
    -- Set default team if not provided
    IF p_team_id IS NULL THEN
        SELECT id INTO v_team_id FROM teams ORDER BY created_at DESC LIMIT 1;
    ELSE
        v_team_id := p_team_id;
    END IF;

    -- Insert players from volleyball registrations
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
            current_team_id,
            created_at,
            updated_at
        )
        SELECT 
            tr.id,
            CONCAT(tr.first_name, ' ', tr.last_name) as name,
            -- Take the first preferred position from the array, default to ANY_POSITION if none
            COALESCE(
                tr.playing_positions[1], 
                'ANY_POSITION'
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
            'AVAILABLE'::player_status as status, -- Set status to AVAILABLE for all players
            tr.tshirt_size,
            -- Check if profile_image_url is NULL or empty, and if so, generate a placeholder
            CASE 
                WHEN tr.profile_image_url IS NULL OR tr.profile_image_url = '' 
                THEN 'https://ui-avatars.com/api/?name=' || REPLACE(CONCAT(tr.first_name, '+', tr.last_name), ' ', '+') || '&size=256&background=random'
                ELSE tr.profile_image_url
            END as profile_image_url,
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
            v_team_id,
            tr.created_at,
            tr.updated_at
        FROM tournament_registrations tr
        WHERE tr.registration_category::text LIKE 'VOLLEYBALL%' -- Only copy volleyball registrations
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

    RETURN QUERY SELECT v_players_added;
END;
$$ LANGUAGE plpgsql;

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
            profile_image_url = CASE 
                WHEN tr.profile_image_url IS NULL OR tr.profile_image_url = '' OR tr.profile_image_url LIKE '%ui-avatars.com%'
                THEN 'https://ui-avatars.com/api/?name=' || REPLACE(CONCAT(tr.first_name, '+', tr.last_name), ' ', '+') || '&size=256&background=random'
                ELSE tr.profile_image_url
            END,
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
            AND tr.registration_category::text LIKE 'VOLLEYBALL%' -- Cast enum to text before using LIKE
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
        WHERE registration_category::text LIKE 'VOLLEYBALL%' -- Cast enum to text before using LIKE
        GROUP BY skill_level
    ),
    player_stats AS (
        SELECT 
            p.skill_level::TEXT,
            COUNT(*) as players_created
        FROM players p
        JOIN tournament_registrations tr ON p.id = tr.id
        WHERE tr.registration_category::text LIKE 'VOLLEYBALL%' -- Cast enum to text before using LIKE
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

-- Master function to execute the volleyball players migration
CREATE OR REPLACE FUNCTION execute_volleyball_players_migration(
    p_team_id UUID DEFAULT NULL,
    p_update_existing BOOLEAN DEFAULT FALSE,
    p_cleanup_first BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    operation TEXT,
    count INTEGER
) AS $$
DECLARE
    v_cleanup_count INTEGER := 0;
    v_added_count INTEGER := 0;
    v_updated_count INTEGER := 0;
BEGIN
    -- Clean up existing players if requested
    IF p_cleanup_first THEN
        SELECT cleanup_volleyball_players() INTO v_cleanup_count;
        RETURN QUERY SELECT 'Players cleaned up'::TEXT, v_cleanup_count;
    END IF;
    
    -- Copy new players
    SELECT players_added INTO v_added_count FROM copy_volleyball_registrations_to_players(p_team_id);
    RETURN QUERY SELECT 'Players added'::TEXT, v_added_count;
    
    -- Update existing players if requested
    IF p_update_existing THEN
        SELECT players_updated INTO v_updated_count FROM update_players_from_volleyball_registrations(p_team_id);
        RETURN QUERY SELECT 'Players updated'::TEXT, v_updated_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- To copy new players only:
-- SELECT * FROM execute_volleyball_players_migration();

-- To clean up existing players and then copy new ones:
-- SELECT * FROM execute_volleyball_players_migration(NULL, FALSE, TRUE);

-- To copy new players and update existing ones:
-- SELECT * FROM execute_volleyball_players_migration(NULL, TRUE, FALSE);

-- To clean up, copy new players, and update existing ones:
-- SELECT * FROM execute_volleyball_players_migration(NULL, TRUE, TRUE);

-- To get statistics after migration:
-- SELECT * FROM get_volleyball_players_statistics(); 