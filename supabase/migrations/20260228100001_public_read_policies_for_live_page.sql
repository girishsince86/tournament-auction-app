-- Add public (anon) SELECT policies for tables needed by the public live spectator page.
-- Without these, the anon key cannot read teams, queue, or tournament data.

DO $$
BEGIN
  -- teams: allow public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'teams' AND policyname = 'Allow public read access for teams'
  ) THEN
    CREATE POLICY "Allow public read access for teams"
      ON public.teams FOR SELECT
      TO public
      USING (true);
  END IF;

  -- auction_queue: allow public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_queue' AND policyname = 'Allow public read access for auction_queue'
  ) THEN
    CREATE POLICY "Allow public read access for auction_queue"
      ON public.auction_queue FOR SELECT
      TO public
      USING (true);
  END IF;

  -- tournaments: allow public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tournaments' AND policyname = 'Allow public read access for tournaments'
  ) THEN
    CREATE POLICY "Allow public read access for tournaments"
      ON public.tournaments FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;
