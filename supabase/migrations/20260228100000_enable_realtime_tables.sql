-- Enable Supabase Realtime for teams and players tables.
-- auction_rounds and auction_queue may already be in the publication;
-- the IF NOT EXISTS pattern below prevents errors if they already are.

DO $$
BEGIN
    -- Add teams table to realtime publication if not already present
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'teams'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE teams;
    END IF;

    -- Add players table to realtime publication if not already present
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'players'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE players;
    END IF;

    -- Ensure auction_rounds is in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'auction_rounds'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE auction_rounds;
    END IF;

    -- Ensure auction_queue is in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'auction_queue'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE auction_queue;
    END IF;
END
$$;
