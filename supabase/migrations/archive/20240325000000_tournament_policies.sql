-- Create policies
CREATE POLICY "Tournaments are viewable by authenticated users"
    ON tournaments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Tournaments are modifiable by admin users"
    ON tournaments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Rollback SQL
DROP POLICY IF EXISTS "Tournaments are viewable by authenticated users" ON tournaments;
DROP POLICY IF EXISTS "Tournaments are modifiable by admin users" ON tournaments;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY; 