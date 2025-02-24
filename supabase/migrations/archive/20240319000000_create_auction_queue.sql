-- Create auction_queue table
CREATE TABLE auction_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL,
    player_id UUID NOT NULL,
    queue_position INTEGER NOT NULL,
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Constraints
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(tournament_id, queue_position),
    UNIQUE(tournament_id, player_id)
);

-- Add indexes for efficient querying
CREATE INDEX idx_auction_queue_tournament ON auction_queue(tournament_id) WHERE NOT is_processed;
CREATE INDEX idx_auction_queue_position ON auction_queue(tournament_id, queue_position);

-- Enable RLS
ALTER TABLE auction_queue ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for authenticated users" ON auction_queue
    FOR SELECT
    TO authenticated
    USING (true);

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable write access for admin users" ON auction_queue;

-- Create new write access policy
CREATE POLICY "Enable write access for admin users" ON auction_queue
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Add updated_at trigger
CREATE TRIGGER update_auction_queue_updated_at
    BEFORE UPDATE ON auction_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 