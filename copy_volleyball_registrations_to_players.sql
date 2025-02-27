-- Script to copy volleyball registrations to Players table
-- This script will:
-- 1. Copy only volleyball registrations to the Players table
-- 2. Set the status to 'AVAILABLE' for all players
-- 3. Properly populate the profile_image_url and registration_data JSONB fields
-- 4. Not populate the category_id field as requested

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

    -- Insert players from verified volleyball registrations
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
            -- Check if profile_image_url is NULL, empty, or contains ui-avatars.com, and if so, generate a placeholder
            CASE 
                WHEN tr.profile_image_url IS NULL OR tr.profile_image_url = '' OR tr.profile_image_url LIKE '%ui-avatars.com%'
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

-- Execute the function to copy volleyball registrations to players
SELECT * FROM copy_volleyball_registrations_to_players();

-- Function to check the results
CREATE OR REPLACE FUNCTION check_volleyball_players_copy()
RETURNS TABLE (
    total_volleyball_registrations INTEGER,
    total_players_copied INTEGER,
    players_not_copied INTEGER
) AS $$
DECLARE
    v_total_registrations INTEGER;
    v_players_copied INTEGER;
    v_players_not_copied INTEGER;
BEGIN
    -- Count total volleyball registrations
    SELECT 
        COUNT(*) INTO v_total_registrations
    FROM tournament_registrations
    WHERE registration_category::text LIKE 'VOLLEYBALL%'; -- Cast enum to text before using LIKE
    
    -- Count players copied from volleyball registrations
    SELECT 
        COUNT(*) INTO v_players_copied
    FROM players p
    WHERE EXISTS (
        SELECT 1 
        FROM tournament_registrations tr 
        WHERE tr.id = p.id
        AND tr.registration_category::text LIKE 'VOLLEYBALL%' -- Cast enum to text before using LIKE
    );
    
    -- Calculate players not copied
    v_players_not_copied := v_total_registrations - v_players_copied;
    
    RETURN QUERY SELECT v_total_registrations, v_players_copied, v_players_not_copied;
END;
$$ LANGUAGE plpgsql;

-- Check the results
SELECT * FROM check_volleyball_players_copy(); 