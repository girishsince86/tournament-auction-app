-- Drop existing policy
DROP POLICY IF EXISTS "Enable write access for admin users" ON auction_queue;

-- Create new write access policy for both admin and conductor users
CREATE POLICY "Enable write access for admin and conductor users" ON auction_queue
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_app_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'CONDUCTOR'
                OR auth.users.email IN (
                    'gk@pbel.in',
                    'admin@pbel.in',
                    'amit@pbel.in',
                    'vasu@pbel.in',
                    'conductor@pbel.in',
                    'team@pbel.in',
                    'auction@pbel.in'
                )
            )
        )
    ); 