-- Drop existing policies
DROP POLICY IF EXISTS "Enable write access for admin users" ON auction_queue;
DROP POLICY IF EXISTS "Enable write access for admin and conductor users" ON auction_queue;

-- Create a simple policy that allows all authenticated users to modify the auction queue
-- The API layer will handle the specific authorization checks
CREATE POLICY "Enable write access for all authenticated users" ON auction_queue
    FOR ALL
    TO authenticated
    USING (true);

-- Note: This policy allows any authenticated user to modify the auction queue
-- The actual authorization checks are now handled in the API route 