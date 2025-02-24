-- Create player categories table
CREATE TABLE player_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    name TEXT NOT NULL,
    category_type player_category_type NOT NULL,
    base_points INTEGER NOT NULL CHECK (base_points >= 0),
    min_points INTEGER NOT NULL CHECK (min_points >= 0),
    max_points INTEGER CHECK (max_points >= min_points),
    description TEXT,
    skill_level skill_level NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, name)
);

-- Create player achievements table
CREATE TABLE player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id),
    tournament_name TEXT,
    achievement_type achievement_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    achievement_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers for updated_at
CREATE TRIGGER update_player_categories_updated_at
    BEFORE UPDATE ON player_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_achievements_updated_at
    BEFORE UPDATE ON player_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE player_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Player categories are viewable by authenticated users"
    ON player_categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Player categories are modifiable by authenticated users"
    ON player_categories FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Player achievements are viewable by authenticated users"
    ON player_achievements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Player achievements are modifiable by authenticated users"
    ON player_achievements FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add category_id to players table
ALTER TABLE players
ADD COLUMN category_id UUID REFERENCES player_categories(id);

-- Rollback SQL
-- DROP TRIGGER IF EXISTS update_player_categories_updated_at ON player_categories;
-- DROP TRIGGER IF EXISTS update_player_achievements_updated_at ON player_achievements;
-- ALTER TABLE players DROP COLUMN IF EXISTS category_id;
-- DROP TABLE IF EXISTS player_achievements;
-- DROP TABLE IF EXISTS player_categories; 