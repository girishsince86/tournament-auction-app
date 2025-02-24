-- Function to swap priorities between two preferred players
CREATE OR REPLACE FUNCTION swap_preferred_player_priorities(
    p_team_id UUID,
    p_player_id_1 UUID,
    p_player_id_2 UUID,
    p_priority_1 INTEGER,
    p_priority_2 INTEGER
)
RETURNS void AS $$
BEGIN
    -- If there's no target player (p_player_id_2 is null),
    -- just update the single player's priority
    IF p_player_id_2 IS NULL THEN
        UPDATE preferred_players
        SET 
            priority = p_priority_2,
            updated_at = NOW()
        WHERE team_id = p_team_id
        AND player_id = p_player_id_1;
        RETURN;
    END IF;

    -- Otherwise, swap priorities between the two players
    UPDATE preferred_players
    SET 
        priority = CASE 
            WHEN player_id = p_player_id_1 THEN p_priority_2
            WHEN player_id = p_player_id_2 THEN p_priority_1
        END,
        updated_at = NOW()
    WHERE team_id = p_team_id
    AND player_id IN (p_player_id_1, p_player_id_2);
END;
$$ LANGUAGE plpgsql;

-- Function to reorder priorities after deletion
CREATE OR REPLACE FUNCTION reorder_preferred_player_priorities()
RETURNS TRIGGER AS $$
DECLARE
    v_current_priority INTEGER;
    v_team_id UUID;
BEGIN
    -- Store the deleted priority and team_id
    v_current_priority := OLD.priority;
    v_team_id := OLD.team_id;

    -- Update priorities for all players with higher priority
    UPDATE preferred_players
    SET 
        priority = priority - 1,
        updated_at = NOW()
    WHERE team_id = v_team_id
    AND priority > v_current_priority;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reordering priorities after deletion
CREATE TRIGGER reorder_priorities_after_delete
    AFTER DELETE ON preferred_players
    FOR EACH ROW
    EXECUTE FUNCTION reorder_preferred_player_priorities();

-- Function to ensure new players get the next available priority
CREATE OR REPLACE FUNCTION set_next_priority()
RETURNS TRIGGER AS $$
DECLARE
    v_next_priority INTEGER;
BEGIN
    -- If priority is already set, do nothing
    IF NEW.priority IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Get the next available priority
    SELECT COALESCE(MAX(priority), 0) + 1
    INTO v_next_priority
    FROM preferred_players
    WHERE team_id = NEW.team_id;

    -- Set the priority
    NEW.priority := v_next_priority;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for setting next priority
CREATE TRIGGER set_next_priority_before_insert
    BEFORE INSERT ON preferred_players
    FOR EACH ROW
    EXECUTE FUNCTION set_next_priority();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION swap_preferred_player_priorities TO authenticated;
GRANT EXECUTE ON FUNCTION reorder_preferred_player_priorities TO authenticated;
GRANT EXECUTE ON FUNCTION set_next_priority TO authenticated;

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS set_next_priority_before_insert ON preferred_players;
DROP TRIGGER IF EXISTS reorder_priorities_after_delete ON preferred_players;
DROP FUNCTION IF EXISTS set_next_priority;
DROP FUNCTION IF EXISTS reorder_preferred_player_priorities;
DROP FUNCTION IF EXISTS swap_preferred_player_priorities;
*/ 