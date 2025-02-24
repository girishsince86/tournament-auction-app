-- Create function to update queue positions
CREATE OR REPLACE FUNCTION update_queue_positions(
    p_queue_id UUID,
    p_tournament_id UUID,
    p_old_position INTEGER,
    p_new_position INTEGER
) RETURNS void AS $$
BEGIN
    -- Moving down
    IF p_new_position > p_old_position THEN
        -- Shift items up
        UPDATE auction_queue
        SET queue_position = queue_position - 1
        WHERE tournament_id = p_tournament_id
        AND queue_position > p_old_position
        AND queue_position <= p_new_position
        AND id != p_queue_id;
    -- Moving up
    ELSIF p_new_position < p_old_position THEN
        -- Shift items down
        UPDATE auction_queue
        SET queue_position = queue_position + 1
        WHERE tournament_id = p_tournament_id
        AND queue_position >= p_new_position
        AND queue_position < p_old_position
        AND id != p_queue_id;
    END IF;

    -- Update the target item's position
    UPDATE auction_queue
    SET queue_position = p_new_position
    WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql; 