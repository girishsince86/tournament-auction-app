-- Drop the RLS policy for tournament_registrations
DROP POLICY IF EXISTS "Registrations are viewable by admin and conductors" ON tournament_registrations;

-- Disable RLS on the tournament_registrations table
ALTER TABLE tournament_registrations DISABLE ROW LEVEL SECURITY;

-- Log the change for verification
DO $$ 
BEGIN
  RAISE NOTICE 'RLS policy removed and RLS disabled for tournament_registrations table';
END $$; 