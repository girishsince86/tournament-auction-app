-- Drop existing objects first (in correct order)
DROP TABLE IF EXISTS verification_statistics CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tournament_rules CASCADE;
DROP TABLE IF EXISTS tournament_registrations_backup_youth_sizes CASCADE;
DROP TABLE IF EXISTS tournament_registrations_backup_sizes CASCADE;
DROP TABLE IF EXISTS tournament_registrations CASCADE;
DROP TABLE IF EXISTS team_summaries CASCADE;
DROP TABLE IF EXISTS team_combined_requirements CASCADE;
DROP TABLE IF EXISTS team_budget_analysis CASCADE;
DROP TABLE IF EXISTS preferred_players CASCADE;
DROP TABLE IF EXISTS players_backup_youth_sizes CASCADE;
DROP TABLE IF EXISTS players_backup_sizes CASCADE;
DROP TABLE IF EXISTS player_tournament_history CASCADE;
DROP TABLE IF EXISTS player_categories CASCADE;
DROP TABLE IF EXISTS player_achievements CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auction_state CASCADE;
DROP TABLE IF EXISTS auction_settings CASCADE;
DROP TABLE IF EXISTS auction_rounds CASCADE;
DROP TABLE IF EXISTS auction_queue CASCADE;
DROP TABLE IF EXISTS auction_display_config CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'CONDUCTOR', 'TEAM_OWNER');
    CREATE TYPE player_status AS ENUM ('AVAILABLE', 'DRAFTED', 'INACTIVE');
    CREATE TYPE player_position AS ENUM ('SETTER', 'MIDDLE_BLOCKER', 'OUTSIDE_HITTER', 'OPPOSITE', 'LIBERO');
    CREATE TYPE skill_level AS ENUM ('COMPETITIVE_A', 'COMPETITIVE_B', 'COMPETITIVE_C', 'RECREATIONAL');
    CREATE TYPE category_type AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3');
    CREATE TYPE auction_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
    CREATE TYPE tshirt_size AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');
    CREATE TYPE achievement_type AS ENUM ('TOURNAMENT_WIN', 'BEST_PLAYER', 'MOST_VALUABLE_PLAYER', 'BEST_SETTER', 'BEST_ATTACKER', 'BEST_BLOCKER', 'BEST_LIBERO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables in correct order (respecting foreign key dependencies)
CREATE TABLE IF NOT EXISTS tournaments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    registration_deadline date NOT NULL,
    max_teams integer NOT NULL,
    max_players_per_team integer NOT NULL,
    min_players_per_team integer NOT NULL,
    team_points_budget integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tournaments_pkey PRIMARY KEY (id),
    CONSTRAINT tournaments_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS teams (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(100) NOT NULL,
    owner_name character varying(100) NOT NULL,
    initial_budget integer NOT NULL DEFAULT 5000000,
    remaining_budget integer NOT NULL DEFAULT 5000000,
    max_players integer NOT NULL DEFAULT 12,
    owner_id uuid NOT NULL,
    tournament_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT teams_pkey PRIMARY KEY (id),
    CONSTRAINT teams_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT teams_tournament_id_name_key UNIQUE (tournament_id, name)
);

CREATE TABLE IF NOT EXISTS player_categories (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    tournament_id uuid NOT NULL,
    name text NOT NULL,
    category_type category_type NOT NULL,
    base_points integer NOT NULL,
    min_points integer NOT NULL,
    max_points integer,
    description text,
    skill_level skill_level NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT player_categories_pkey PRIMARY KEY (id),
    CONSTRAINT player_categories_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT player_categories_tournament_id_name_key UNIQUE (tournament_id, name)
);

CREATE TABLE IF NOT EXISTS players (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(100) NOT NULL,
    age integer,
    player_position player_position NOT NULL,
    base_price integer NOT NULL,
    current_team_id uuid,
    image_url text,
    status player_status DEFAULT 'AVAILABLE',
    phone_number character varying(15),
    apartment_number character varying(50),
    jersey_number character varying(10),
    skill_level skill_level,
    height integer,
    experience integer,
    tshirt_size tshirt_size,
    category_id uuid,
    registration_data jsonb,
    profile_image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT players_pkey PRIMARY KEY (id),
    CONSTRAINT players_category_id_fkey FOREIGN KEY (category_id) REFERENCES player_categories(id)
);

CREATE TABLE IF NOT EXISTS tournament_registrations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone_number text NOT NULL,
    flat_number text NOT NULL,
    height numeric NOT NULL,
    registration_category category_type NOT NULL,
    registration_type text NOT NULL,
    playing_positions player_position[] NOT NULL,
    skill_level skill_level NOT NULL,
    tshirt_number text NOT NULL,
    tshirt_name text NOT NULL,
    payment_upi_id text NOT NULL,
    payment_transaction_id text NOT NULL,
    paid_to text NOT NULL,
    email text,
    date_of_birth date,
    parent_name text,
    parent_phone_number text,
    verified_by text,
    amount_received numeric,
    tshirt_size tshirt_size,
    profile_image_url text,
    profile_token text,
    profile_token_expires_at timestamp with time zone,
    is_verified boolean DEFAULT false,
    verification_notes text,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tournament_registrations_pkey PRIMARY KEY (id),
    CONSTRAINT tournament_registrations_profile_token_key UNIQUE (profile_token)
);

CREATE TABLE IF NOT EXISTS users (
    id uuid NOT NULL,
    email text NOT NULL,
    role user_role NOT NULL DEFAULT 'TEAM_OWNER',
    team_id uuid,
    name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS auction_settings (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    min_players_per_team integer NOT NULL DEFAULT 7,
    max_players_per_team integer NOT NULL DEFAULT 14,
    min_bid_increment integer NOT NULL DEFAULT 100000,
    timer_duration_seconds integer NOT NULL DEFAULT 30,
    min_setters integer NOT NULL DEFAULT 1,
    min_outside_hitters integer NOT NULL DEFAULT 2,
    min_middle_blockers integer NOT NULL DEFAULT 2,
    min_opposites integer NOT NULL DEFAULT 1,
    min_liberos integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT auction_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS auction_rounds (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    tournament_id uuid NOT NULL,
    player_id uuid NOT NULL,
    starting_price integer NOT NULL,
    final_price integer,
    winning_team_id uuid,
    status auction_status NOT NULL DEFAULT 'NOT_STARTED',
    start_time timestamp with time zone NOT NULL DEFAULT now(),
    end_time timestamp with time zone,
    final_points integer,
    is_manual_entry boolean DEFAULT false,
    conductor_notes text,
    display_sequence integer,
    auction_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT auction_rounds_pkey PRIMARY KEY (id),
    CONSTRAINT auction_rounds_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id),
    CONSTRAINT auction_rounds_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT auction_rounds_winning_team_id_fkey FOREIGN KEY (winning_team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS bids (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    round_id uuid NOT NULL,
    team_id uuid NOT NULL,
    amount integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT bids_pkey PRIMARY KEY (id),
    CONSTRAINT bids_round_id_fkey FOREIGN KEY (round_id) REFERENCES auction_rounds(id),
    CONSTRAINT bids_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS auction_queue (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    tournament_id uuid NOT NULL,
    player_id uuid NOT NULL,
    queue_position integer NOT NULL,
    is_processed boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT auction_queue_pkey PRIMARY KEY (id),
    CONSTRAINT auction_queue_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id),
    CONSTRAINT auction_queue_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT auction_queue_tournament_id_player_id_key UNIQUE (tournament_id, player_id),
    CONSTRAINT auction_queue_tournament_id_queue_position_key UNIQUE (tournament_id, queue_position)
);

CREATE TABLE IF NOT EXISTS auction_display_config (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    tournament_id uuid NOT NULL,
    initial_timer_seconds integer NOT NULL DEFAULT 30,
    subsequent_timer_seconds integer NOT NULL DEFAULT 20,
    first_call_seconds integer NOT NULL DEFAULT 10,
    second_call_seconds integer NOT NULL DEFAULT 5,
    final_call_seconds integer NOT NULL DEFAULT 2,
    enable_sound boolean DEFAULT true,
    enable_visual_effects boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT auction_display_config_pkey PRIMARY KEY (id),
    CONSTRAINT auction_display_config_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT auction_display_config_tournament_id_key UNIQUE (tournament_id)
);

CREATE TABLE IF NOT EXISTS auction_state (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    status text NOT NULL DEFAULT 'WAITING',
    current_player_id uuid,
    current_round integer NOT NULL DEFAULT 0,
    bid_end_time timestamp with time zone,
    winning_bid_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT auction_state_pkey PRIMARY KEY (id),
    CONSTRAINT auction_state_current_player_id_fkey FOREIGN KEY (current_player_id) REFERENCES players(id),
    CONSTRAINT auction_state_winning_bid_id_fkey FOREIGN KEY (winning_bid_id) REFERENCES bids(id)
);

CREATE TABLE IF NOT EXISTS player_achievements (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    player_id uuid NOT NULL,
    tournament_name text,
    achievement_type achievement_type NOT NULL,
    title text NOT NULL,
    description text,
    achievement_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT player_achievements_pkey PRIMARY KEY (id),
    CONSTRAINT player_achievements_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS player_tournament_history (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    player_id uuid NOT NULL,
    name text NOT NULL,
    year integer NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT player_tournament_history_pkey PRIMARY KEY (id),
    CONSTRAINT player_tournament_history_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS preferred_players (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    team_id uuid NOT NULL,
    player_id uuid NOT NULL,
    priority integer NOT NULL DEFAULT 1,
    notes text,
    max_bid integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT preferred_players_pkey PRIMARY KEY (id),
    CONSTRAINT preferred_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id),
    CONSTRAINT preferred_players_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id),
    CONSTRAINT preferred_players_team_id_player_id_key UNIQUE (team_id, player_id)
);

CREATE TABLE IF NOT EXISTS team_combined_requirements (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    team_id uuid NOT NULL,
    position player_position NOT NULL,
    skill_level skill_level NOT NULL,
    min_players integer NOT NULL DEFAULT 0,
    max_players integer NOT NULL,
    current_count integer NOT NULL DEFAULT 0,
    points_allocated integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT team_combined_requirements_pkey PRIMARY KEY (id),
    CONSTRAINT team_combined_requirements_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id),
    CONSTRAINT team_combined_requirements_team_id_position_skill_level_key UNIQUE (team_id, position, skill_level)
);

CREATE TABLE IF NOT EXISTS tournament_rules (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    rule_text text NOT NULL,
    rule_order integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tournament_rules_pkey PRIMARY KEY (id)
);

-- Create views
CREATE OR REPLACE VIEW team_budget_analysis AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.initial_budget,
    t.remaining_budget,
    COUNT(pp.id) as number_of_preferred_players,
    SUM(p.base_price) as total_preferred_points,
    t.remaining_budget - SUM(LEAST(pp.max_bid, p.base_price)) as potential_remaining_budget
FROM teams t
LEFT JOIN preferred_players pp ON t.id = pp.team_id
LEFT JOIN players p ON pp.player_id = p.id
GROUP BY t.id, t.name, t.initial_budget, t.remaining_budget;

CREATE OR REPLACE VIEW team_summaries AS
SELECT 
    t.id,
    t.name,
    t.remaining_budget as budget,
    COUNT(p.id) as player_count,
    jsonb_object_agg(
        p.player_position,
        COUNT(p.id)
    ) as position_distribution
FROM teams t
LEFT JOIN players p ON p.current_team_id = t.id
GROUP BY t.id, t.name, t.remaining_budget;

CREATE OR REPLACE VIEW verification_statistics AS
SELECT 
    verified_by as verifier_email,
    COUNT(*) as total_verifications,
    COUNT(*) FILTER (WHERE verified_at >= NOW() - INTERVAL '24 hours') as verifications_last_24h,
    MIN(verified_at) as first_verification,
    MAX(verified_at) as last_verification
FROM tournament_registrations
WHERE verified_by IS NOT NULL
GROUP BY verified_by;

-- Enable RLS on all tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_display_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_tournament_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferred_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_combined_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_rules ENABLE ROW LEVEL SECURITY;

-- Create trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION validate_max_bid()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.max_bid <= 0 THEN
        RAISE EXCEPTION 'Max bid must be greater than 0';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION enforce_single_settings_row()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM auction_settings) > 0 THEN
        RAISE EXCEPTION 'Only one settings row is allowed';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_team_points_on_allocation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.winning_team_id IS NOT NULL AND OLD.winning_team_id IS NULL THEN
        UPDATE teams 
        SET remaining_budget = remaining_budget - NEW.final_points
        WHERE id = NEW.winning_team_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION handle_new_bid()
RETURNS TRIGGER AS $$
BEGIN
    -- Update auction state with the new winning bid
    UPDATE auction_state
    SET winning_bid_id = NEW.id
    WHERE current_player_id = (
        SELECT player_id 
        FROM auction_rounds 
        WHERE id = NEW.round_id
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_base_price_on_skill_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.skill_level IS DISTINCT FROM OLD.skill_level THEN
        -- Update base price based on skill level
        NEW.base_price = CASE
            WHEN NEW.skill_level = 'COMPETITIVE_A' THEN 400
            WHEN NEW.skill_level = 'COMPETITIVE_B' THEN 300
            WHEN NEW.skill_level = 'COMPETITIVE_C' THEN 200
            WHEN NEW.skill_level = 'RECREATIONAL' THEN 100
            ELSE NEW.base_price
        END;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_price_trigger
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_base_price_on_skill_change();

CREATE TRIGGER update_tournament_registrations_updated_at
    BEFORE UPDATE ON tournament_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_settings_updated_at
    BEFORE UPDATE ON auction_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER enforce_single_settings_row
    BEFORE INSERT ON auction_settings
    FOR EACH ROW
    EXECUTE FUNCTION enforce_single_settings_row();

CREATE TRIGGER update_auction_rounds_updated_at
    BEFORE UPDATE ON auction_rounds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_points_after_allocation
    AFTER UPDATE ON auction_rounds
    FOR EACH ROW
    EXECUTE FUNCTION update_team_points_on_allocation();

CREATE TRIGGER update_bids_updated_at
    BEFORE UPDATE ON bids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER notify_new_bid
    AFTER INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_bid();

CREATE TRIGGER update_auction_queue_updated_at
    BEFORE UPDATE ON auction_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_display_config_updated_at
    BEFORE UPDATE ON auction_display_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_state_updated_at
    BEFORE UPDATE ON auction_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_achievements_updated_at
    BEFORE UPDATE ON player_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_tournament_history_updated_at
    BEFORE UPDATE ON player_tournament_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER validate_max_bid_before_insert_update
    BEFORE INSERT OR UPDATE ON preferred_players
    FOR EACH ROW
    EXECUTE FUNCTION validate_max_bid();

CREATE TRIGGER update_team_combined_requirements_updated_at
    BEFORE UPDATE ON team_combined_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_rules_updated_at
    BEFORE UPDATE ON tournament_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
CREATE POLICY "Tournaments are viewable by authenticated users"
ON tournaments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Tournaments are modifiable by specific users"
ON tournaments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Teams are viewable by authenticated users"
ON teams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teams are modifiable by authenticated users"
ON teams FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public read access"
ON players FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable all access for authenticated users"
ON players FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public to view registrations"
ON tournament_registrations FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable public insert access"
ON tournament_registrations FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow authorized verifiers to view all registrations"
ON tournament_registrations FOR SELECT
TO public
USING ((auth.jwt() IS NOT NULL) AND ((auth.jwt() ->> 'email') = 'amit@pbel.in' OR (auth.jwt() ->> 'email') = 'vasu@pbel.in'));

CREATE POLICY "Allow authorized verifiers to update registrations"
ON tournament_registrations FOR ALL
TO public
USING ((auth.jwt() IS NOT NULL) AND ((auth.jwt() ->> 'email') = 'amit@pbel.in' OR (auth.jwt() ->> 'email') = 'vasu@pbel.in'))
WITH CHECK ((auth.jwt() IS NOT NULL) AND ((auth.jwt() ->> 'email') = 'amit@pbel.in' OR (auth.jwt() ->> 'email') = 'vasu@pbel.in'));

CREATE POLICY "Users can view their own data"
ON users FOR SELECT
TO public
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users FOR ALL
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Only conductor can update user roles"
ON users FOR ALL
TO public
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'CONDUCTOR'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'CONDUCTOR'));

CREATE POLICY "Enable all access for authenticated users"
ON auction_settings FOR ALL
TO public
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users"
ON auction_rounds FOR SELECT
TO public
USING (true);

CREATE POLICY "Only conductor can create rounds"
ON auction_rounds FOR ALL
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'CONDUCTOR'));

CREATE POLICY "Enable read access for all users"
ON bids FOR SELECT
TO public
USING (true);

CREATE POLICY "Team owners can only bid for their team"
ON bids FOR ALL
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND (users.role = 'CONDUCTOR' OR (users.role = 'TEAM_OWNER' AND users.team_id = bids.team_id))
));

CREATE POLICY "Enable read access for authenticated users"
ON auction_queue FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write access for admin users"
ON auction_queue FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') = ANY (ARRAY['ADMIN', 'CONDUCTOR']))
WITH CHECK ((auth.jwt() ->> 'role') = ANY (ARRAY['ADMIN', 'CONDUCTOR']));

CREATE POLICY "Player achievements are viewable by authenticated users"
ON player_achievements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Player achievements are modifiable by authenticated users"
ON player_achievements FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users"
ON preferred_players FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON preferred_players FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Team combined requirements are viewable by authenticated users"
ON team_combined_requirements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Team combined requirements are modifiable by authenticated user"
ON team_combined_requirements FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Tournament rules are viewable by everyone"
ON tournament_rules FOR SELECT
TO public
USING (true); 