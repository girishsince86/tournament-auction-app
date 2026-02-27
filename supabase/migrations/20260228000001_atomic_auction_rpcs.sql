-- =============================================================================
-- Atomic Auction RPCs
--
-- Replaces the multi-step, non-atomic bid/undo logic in the API routes with
-- single RPC calls that run inside a Postgres transaction. Uses SELECT FOR
-- UPDATE to prevent race conditions (e.g., double-spending a team's budget).
--
-- Also drops the update_team_points_after_allocation trigger, which would
-- cause double-deduction when used alongside these RPCs.
-- =============================================================================

-- Drop the trigger that auto-deducts budget on auction_rounds UPDATE.
-- The new record_auction_bid() RPC handles budget deduction atomically.
DROP TRIGGER IF EXISTS update_team_points_after_allocation ON auction_rounds;

-- -----------------------------------------------------------------------------
-- record_auction_bid: Atomically record an auction result
--
-- In a single transaction:
--   1. Validates inputs (amount > 0, budget sufficient, roster not full, player available)
--   2. Locks the team and player rows (FOR UPDATE) to prevent concurrent bid races
--   3. Creates or updates the auction_round
--   4. Deducts final_points from the team's remaining_budget
--   5. Sets the player status to ALLOCATED with current_team_id
--
-- If ANY step fails, the entire transaction rolls back.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_auction_bid(
    p_tournament_id UUID,
    p_player_id UUID,
    p_team_id UUID,
    p_amount INTEGER,
    p_sport_category TEXT DEFAULT 'VOLLEYBALL_OPEN_MEN'
) RETURNS JSONB AS $$
DECLARE
    v_team RECORD;
    v_player RECORD;
    v_round RECORD;
    v_existing_round RECORD;
    v_current_player_count INTEGER;
    v_max_players INTEGER;
BEGIN
    -- Input validation
    IF p_tournament_id IS NULL THEN
        RAISE EXCEPTION 'Tournament ID is required';
    END IF;

    IF p_player_id IS NULL THEN
        RAISE EXCEPTION 'Player ID is required';
    END IF;

    IF p_team_id IS NULL THEN
        RAISE EXCEPTION 'Team ID is required';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Bid amount must be a positive number';
    END IF;

    -- Lock and fetch team (FOR UPDATE prevents concurrent bid race conditions)
    SELECT * INTO v_team
    FROM teams
    WHERE id = p_team_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Team not found';
    END IF;

    -- Budget check
    IF v_team.remaining_budget < p_amount THEN
        RAISE EXCEPTION 'Insufficient budget. Required: %, Available: %',
            p_amount, v_team.remaining_budget;
    END IF;

    -- Max players check
    v_max_players := COALESCE(v_team.max_players, 12);

    SELECT COUNT(*) INTO v_current_player_count
    FROM players
    WHERE current_team_id = p_team_id;

    IF v_current_player_count >= v_max_players THEN
        RAISE EXCEPTION 'Team has reached maximum player limit (%)', v_max_players;
    END IF;

    -- Lock and fetch player
    SELECT * INTO v_player
    FROM players
    WHERE id = p_player_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player not found';
    END IF;

    IF v_player.status = 'ALLOCATED' THEN
        RAISE EXCEPTION 'Player is already allocated to a team';
    END IF;

    -- Check for existing auction round (skip UNDONE/CANCELLED ones)
    SELECT * INTO v_existing_round
    FROM auction_rounds
    WHERE tournament_id = p_tournament_id
    AND player_id = p_player_id
    AND status NOT IN ('UNDONE', 'CANCELLED')
    FOR UPDATE;

    IF FOUND THEN
        -- Update existing round
        UPDATE auction_rounds
        SET final_points = p_amount,
            winning_team_id = p_team_id,
            status = 'COMPLETED',
            end_time = NOW(),
            updated_at = NOW()
        WHERE id = v_existing_round.id
        RETURNING * INTO v_round;
    ELSE
        -- Create new round
        INSERT INTO auction_rounds (
            tournament_id, player_id, final_points, starting_price,
            winning_team_id, status, sport_category,
            start_time, end_time, auction_date, is_manual_entry,
            created_at, updated_at
        ) VALUES (
            p_tournament_id, p_player_id, p_amount, COALESCE(v_player.base_price, 0),
            p_team_id, 'COMPLETED', p_sport_category,
            NOW(), NOW(), CURRENT_DATE, false,
            NOW(), NOW()
        )
        RETURNING * INTO v_round;
    END IF;

    -- Deduct budget from team
    UPDATE teams
    SET remaining_budget = remaining_budget - p_amount,
        updated_at = NOW()
    WHERE id = p_team_id;

    -- Allocate player to team
    UPDATE players
    SET current_team_id = p_team_id,
        status = 'ALLOCATED',
        updated_at = NOW()
    WHERE id = p_player_id;

    RETURN jsonb_build_object(
        'round_id', v_round.id,
        'player_id', p_player_id,
        'team_id', p_team_id,
        'amount', p_amount,
        'status', 'COMPLETED'
    );
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------------------------------
-- undo_auction_bid: Atomically reverse a player allocation
--
-- In a single transaction:
--   1. Locks the player, auction round, and team rows
--   2. Unallocates the player (status -> AVAILABLE, current_team_id -> NULL)
--   3. Restores final_points to the team's remaining_budget
--   4. Marks the auction round as UNDONE
--
-- If ANY step fails, the entire transaction rolls back.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION undo_auction_bid(
    p_player_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_player RECORD;
    v_round RECORD;
    v_team RECORD;
    v_points_to_restore INTEGER;
BEGIN
    IF p_player_id IS NULL THEN
        RAISE EXCEPTION 'Player ID is required';
    END IF;

    -- Lock and fetch player
    SELECT * INTO v_player
    FROM players
    WHERE id = p_player_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player not found';
    END IF;

    IF v_player.current_team_id IS NULL THEN
        RAISE EXCEPTION 'Player is not allocated to any team';
    END IF;

    -- Find the most recent completed auction round for this player+team
    SELECT * INTO v_round
    FROM auction_rounds
    WHERE player_id = p_player_id
    AND winning_team_id = v_player.current_team_id
    AND status = 'COMPLETED'
    ORDER BY updated_at DESC
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No completed auction round found for this player';
    END IF;

    v_points_to_restore := COALESCE(v_round.final_points, 0);

    -- Lock and fetch team
    SELECT * INTO v_team
    FROM teams
    WHERE id = v_player.current_team_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Team not found';
    END IF;

    -- 1. Unallocate player
    UPDATE players
    SET current_team_id = NULL,
        status = 'AVAILABLE',
        updated_at = NOW()
    WHERE id = p_player_id;

    -- 2. Restore budget
    UPDATE teams
    SET remaining_budget = remaining_budget + v_points_to_restore,
        updated_at = NOW()
    WHERE id = v_team.id;

    -- 3. Mark round as undone
    UPDATE auction_rounds
    SET status = 'UNDONE',
        updated_at = NOW()
    WHERE id = v_round.id;

    RETURN jsonb_build_object(
        'round_id', v_round.id,
        'player_id', p_player_id,
        'player_name', v_player.name,
        'team_id', v_team.id,
        'team_name', v_team.name,
        'points_restored', v_points_to_restore
    );
END;
$$ LANGUAGE plpgsql;
