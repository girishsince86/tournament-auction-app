-- Modify auction rounds table for offline mode
ALTER TABLE auction_rounds
    DROP COLUMN IF EXISTS bid_timeout_seconds,
    DROP COLUMN IF EXISTS auto_extend_seconds,
    ADD COLUMN IF NOT EXISTS final_points INTEGER CHECK (final_points >= 0),
    ADD COLUMN IF NOT EXISTS is_manual_entry BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conductor_notes TEXT,
    ADD COLUMN IF NOT EXISTS display_sequence INTEGER,
    ADD COLUMN IF NOT EXISTS auction_date DATE DEFAULT CURRENT_DATE;

-- Create auction display configuration table
CREATE TABLE auction_display_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    initial_timer_seconds INTEGER NOT NULL DEFAULT 30,
    subsequent_timer_seconds INTEGER NOT NULL DEFAULT 20,
    first_call_seconds INTEGER NOT NULL DEFAULT 10,
    second_call_seconds INTEGER NOT NULL DEFAULT 5,
    final_call_seconds INTEGER NOT NULL DEFAULT 2,
    enable_sound BOOLEAN DEFAULT true,
    enable_visual_effects BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id)
);

-- Add trigger for display config
CREATE TRIGGER update_auction_display_config_updated_at
    BEFORE UPDATE ON auction_display_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS only for auction rounds (critical table)
ALTER TABLE auction_rounds ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policy for auction rounds
CREATE POLICY "Auction rounds access policy"
    ON auction_rounds
    USING (
        CASE 
            WHEN auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR') THEN true
            ELSE EXISTS (
                SELECT 1 FROM teams 
                WHERE id = winning_team_id 
                AND owner_id = auth.uid()
            )
        END
    );

-- Update auction round status type
ALTER TYPE auction_status ADD VALUE IF NOT EXISTS 'SKIPPED';
ALTER TYPE auction_status ADD VALUE IF NOT EXISTS 'MANUAL';

-- Create function to update team points on allocation
CREATE OR REPLACE FUNCTION update_team_points_on_allocation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.winning_team_id IS NOT NULL AND NEW.final_points IS NOT NULL THEN
        -- Update team's remaining points
        UPDATE teams
        SET remaining_budget = remaining_budget - NEW.final_points
        WHERE id = NEW.winning_team_id;
        
        -- Update position requirements count
        UPDATE team_position_requirements
        SET 
            current_count = current_count + 1,
            points_allocated = points_allocated + NEW.final_points
        WHERE team_id = NEW.winning_team_id
        AND position = (
            SELECT player_position 
            FROM players 
            WHERE id = NEW.player_id
        );
        
        -- Update skill requirements count
        UPDATE team_skill_requirements
        SET 
            current_count = current_count + 1,
            points_allocated = points_allocated + NEW.final_points
        WHERE team_id = NEW.winning_team_id
        AND skill_level = (
            SELECT skill_level 
            FROM players 
            WHERE id = NEW.player_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for team points update
CREATE TRIGGER update_team_points_after_allocation
    AFTER UPDATE OF winning_team_id, final_points ON auction_rounds
    FOR EACH ROW
    EXECUTE FUNCTION update_team_points_on_allocation();

-- Rollback SQL
-- DROP TRIGGER IF EXISTS update_team_points_after_allocation ON auction_rounds;
-- DROP FUNCTION IF EXISTS update_team_points_on_allocation();
-- DROP TRIGGER IF EXISTS update_auction_display_config_updated_at ON auction_display_config;
-- DROP TABLE IF EXISTS auction_display_config;
-- ALTER TABLE auction_rounds DROP COLUMN IF EXISTS final_points;
-- ALTER TABLE auction_rounds DROP COLUMN IF EXISTS is_manual_entry;
-- ALTER TABLE auction_rounds DROP COLUMN IF EXISTS conductor_notes;
-- ALTER TABLE auction_rounds DROP COLUMN IF EXISTS display_sequence;
-- ALTER TABLE auction_rounds DROP COLUMN IF EXISTS auction_date; 