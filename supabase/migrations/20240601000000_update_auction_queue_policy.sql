-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable write access for admin users" ON auction_queue;

-- Create new write access policy that allows both admin users and specific emails
CREATE POLICY "Enable write access for admin and specific users" ON auction_queue
    FOR ALL
    TO authenticated
    USING (
        (
            -- Check for admin role
            (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
            OR
            (auth.jwt() ->> 'raw_app_meta_data')::jsonb ->> 'role' = 'admin'
        )
        OR
        -- Check for specific emails
        auth.email() IN (
            'gk@pbel.in',
            'admin@pbel.in',
            'amit@pbel.in',
            'vasu@pbel.in'
            -- Add your email here if needed
        )
    );

-- Add comment to explain the policy
COMMENT ON POLICY "Enable write access for admin and specific users" ON auction_queue IS 
'Allows users with admin role or specific emails to perform all operations on auction_queue'; 