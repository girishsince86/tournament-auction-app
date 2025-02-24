-- Create function to process auction allocation
CREATE OR REPLACE FUNCTION process_auction_allocation(
    p_player_id UUID,
    p_team_id UUID,
    p_queue_item_id UUID
) RETURNS void AS $$
BEGIN
    -- Start transaction
    BEGIN
        -- Clear any existing allocation first
        UPDATE players
        SET 
            status = 'AVAILABLE',
            current_team_id = NULL
        WHERE id = p_player_id;

        -- Update player status and team
        UPDATE players
        SET 
            status = 'ALLOCATED',
            current_team_id = p_team_id
        WHERE id = p_player_id;

        -- Mark queue item as processed
        UPDATE auction_queue
        SET is_processed = true
        WHERE id = p_queue_item_id;

        -- Also mark any other queue items for this player as processed
        UPDATE auction_queue
        SET is_processed = true
        WHERE player_id = p_player_id
        AND id != p_queue_item_id;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback transaction on error
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

-- Rollback SQL
-- DROP FUNCTION IF EXISTS process_auction_allocation; 