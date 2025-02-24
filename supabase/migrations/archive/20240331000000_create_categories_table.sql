-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for category types
CREATE TYPE category_type AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- Create enum for skill levels if not exists
DO $$ BEGIN
    CREATE TYPE skill_level AS ENUM (
        'RECREATIONAL_C',
        'INTERMEDIATE_B',
        'UPPER_INTERMEDIATE_BB',
        'COMPETITIVE_A'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category_type category_type NOT NULL DEFAULT 'LEVEL_1',
    base_points INTEGER NOT NULL DEFAULT 200,
    min_points INTEGER NOT NULL DEFAULT 100,
    max_points INTEGER NOT NULL DEFAULT 400,
    description TEXT,
    skill_level skill_level NOT NULL DEFAULT 'COMPETITIVE_A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, name)
);

-- Create player_categories table for many-to-many relationship
CREATE TABLE IF NOT EXISTS player_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, tournament_id, category_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_tournament ON categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_player_categories_player ON player_categories(player_id);
CREATE INDEX IF NOT EXISTS idx_player_categories_tournament ON player_categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_player_categories_category ON player_categories(category_id);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_player_categories_composite_1 ON player_categories(player_id, tournament_id);
CREATE INDEX IF NOT EXISTS idx_player_categories_composite_2 ON player_categories(tournament_id, category_id);

-- Grant permissions
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_categories ENABLE ROW LEVEL SECURITY;

GRANT ALL ON categories TO authenticated;
GRANT ALL ON player_categories TO authenticated;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON categories
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable write access for authenticated users" ON categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON player_categories
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable write access for authenticated users" ON player_categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Rollback SQL
/*
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON player_categories;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON player_categories;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON categories;

DROP INDEX IF EXISTS idx_player_categories_composite_2;
DROP INDEX IF EXISTS idx_player_categories_composite_1;
DROP INDEX IF EXISTS idx_player_categories_category;
DROP INDEX IF EXISTS idx_player_categories_tournament;
DROP INDEX IF EXISTS idx_player_categories_player;
DROP INDEX IF EXISTS idx_categories_tournament;

DROP TABLE IF EXISTS player_categories;
DROP TABLE IF EXISTS categories;
DROP TYPE IF EXISTS category_type;
-- Note: Don't drop skill_level as it might be used elsewhere
DROP EXTENSION IF EXISTS "uuid-ossp";
*/ 