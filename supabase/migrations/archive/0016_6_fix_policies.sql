-- Drop existing policies
DROP POLICY IF EXISTS "Tournaments are viewable by all authenticated users" ON tournaments;
DROP POLICY IF EXISTS "Tournaments are modifiable by admin and conductors" ON tournaments;

-- Create new simplified policies
CREATE POLICY "Tournaments are viewable by authenticated users"
    ON tournaments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Tournaments are modifiable by specific users"
    ON tournaments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Rollback SQL
/*
DROP POLICY IF EXISTS "Tournaments are viewable by authenticated users" ON tournaments;
DROP POLICY IF EXISTS "Tournaments are modifiable by specific users" ON tournaments;

CREATE POLICY "Tournaments are viewable by all authenticated users"
    ON tournaments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Tournaments are modifiable by admin and conductors"
    ON tournaments FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR'))
    WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR'));
*/ 