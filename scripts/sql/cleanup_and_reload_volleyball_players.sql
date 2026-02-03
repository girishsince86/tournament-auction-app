-- Script to clean up Players table and reload only volleyball registrations
-- This script will:
-- 1. First clean up all existing players that came from volleyball registrations
-- 2. Then clean up any players that don't have a corresponding registration record
-- 3. Finally, load only the volleyball registrations into the Players table

-- Step 1: Clean up existing players that came from volleyball registrations
DO $$
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
            AND tr.registration_category::text LIKE 'VOLLEYBALL%' -- Convert enum to text before using LIKE
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_players;
    
    RAISE NOTICE 'Deleted % players that came from volleyball registrations', v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Clean up orphaned players (players without corresponding registration records)
DO $$
DECLARE
    v_orphaned_count INTEGER;
BEGIN
    -- Delete players that don't have a corresponding registration record
    WITH orphaned_players AS (
        DELETE FROM players p
        WHERE NOT EXISTS (
            SELECT 1 
            FROM tournament_registrations tr 
            WHERE tr.id = p.id
        )
        AND p.registration_data IS NOT NULL -- Only delete players that were created from registrations
        RETURNING id
    )
    SELECT COUNT(*) INTO v_orphaned_count FROM orphaned_players;
    
    RAISE NOTICE 'Deleted % orphaned players (without corresponding registration records)', v_orphaned_count;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Get current player count
DO $$
DECLARE
    v_player_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_player_count FROM players;
    RAISE NOTICE 'Current player count after cleanup: %', v_player_count;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Load volleyball registrations into Players table
DO $$
DECLARE
    v_team_id UUID;
    v_players_added INTEGER;
BEGIN
    -- Get the most recent team ID
    SELECT id INTO v_team_id FROM teams ORDER BY created_at DESC LIMIT 1;
    
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
        WHERE tr.registration_category::text LIKE 'VOLLEYBALL%' -- Convert enum to text before using LIKE
        RETURNING id
    )
    SELECT COUNT(*) INTO v_players_added FROM new_players;
    
    RAISE NOTICE 'Added % players from volleyball registrations', v_players_added;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Verify final counts
DO $$
DECLARE
    v_volleyball_registrations INTEGER;
    v_players_from_volleyball INTEGER;
    v_total_players INTEGER;
    v_avatar_count INTEGER;
    v_original_count INTEGER;
BEGIN
    -- Count volleyball registrations
    SELECT COUNT(*) INTO v_volleyball_registrations 
    FROM tournament_registrations 
    WHERE registration_category::text LIKE 'VOLLEYBALL%'; -- Convert enum to text before using LIKE
    
    -- Count players from volleyball registrations
    SELECT COUNT(*) INTO v_players_from_volleyball 
    FROM players p
    WHERE EXISTS (
        SELECT 1 
        FROM tournament_registrations tr 
        WHERE tr.id = p.id
        AND tr.registration_category::text LIKE 'VOLLEYBALL%' -- Convert enum to text before using LIKE
    );
    
    -- Count total players
    SELECT COUNT(*) INTO v_total_players FROM players;
    
    -- Count players using avatar URLs
    SELECT COUNT(*) INTO v_avatar_count 
    FROM players 
    WHERE profile_image_url LIKE '%ui-avatars.com%';
    
    -- Count players using original URLs
    SELECT COUNT(*) INTO v_original_count 
    FROM players 
    WHERE profile_image_url NOT LIKE '%ui-avatars.com%';
    
    RAISE NOTICE 'Final counts:';
    RAISE NOTICE '- Volleyball registrations: %', v_volleyball_registrations;
    RAISE NOTICE '- Players from volleyball registrations: %', v_players_from_volleyball;
    RAISE NOTICE '- Total players: %', v_total_players;
    RAISE NOTICE '- Players using avatar URLs: %', v_avatar_count;
    RAISE NOTICE '- Players using original URLs: %', v_original_count;
    
    -- Check if counts match
    IF v_volleyball_registrations = v_players_from_volleyball THEN
        RAISE NOTICE 'SUCCESS: All volleyball registrations have been properly copied to the Players table';
    ELSE
        RAISE NOTICE 'WARNING: The number of volleyball registrations (%) does not match the number of players from volleyball registrations (%)', 
            v_volleyball_registrations, v_players_from_volleyball;
    END IF;
END;
$$ LANGUAGE plpgsql; 