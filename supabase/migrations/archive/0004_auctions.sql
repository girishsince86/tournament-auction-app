-- Create auction types
CREATE TYPE auction_status AS ENUM ('NOT_STARTED', 'ACTIVE', 'PAUSED', 'COMPLETED');
CREATE TYPE bid_status AS ENUM ('ACTIVE', 'WINNING', 'OUTBID', 'EXPIRED');

-- Create auction settings table
CREATE TABLE auction_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    min_bid_increment INTEGER NOT NULL DEFAULT 100,
    bid_timeout_seconds INTEGER NOT NULL DEFAULT 30,
    auto_extend_seconds INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id)
);

-- Create auction rounds table
CREATE TABLE auction_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    player_id UUID NOT NULL REFERENCES players(id),
    status auction_status NOT NULL DEFAULT 'NOT_STARTED',
    starting_bid INTEGER NOT NULL,
    current_bid INTEGER,
    winning_team_id UUID REFERENCES teams(id),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, player_id)
);

-- Create bids table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES auction_rounds(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    amount INTEGER NOT NULL,
    status bid_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers
CREATE TRIGGER update_auction_settings_updated_at
    BEFORE UPDATE ON auction_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_rounds_updated_at
    BEFORE UPDATE ON auction_rounds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
    BEFORE UPDATE ON bids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE auction_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Auction settings are viewable by all authenticated users"
    ON auction_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Auction settings are updatable by admin and conductors"
    ON auction_settings FOR UPDATE
    USING (auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR'));

CREATE POLICY "Auction rounds are viewable by all authenticated users"
    ON auction_rounds FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Auction rounds are updatable by admin and conductors"
    ON auction_rounds FOR UPDATE
    USING (auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR'));

CREATE POLICY "Bids are viewable by all authenticated users"
    ON bids FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Bids are insertable by team owners"
    ON bids FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE id = team_id
            AND owner_id = auth.uid()
        )
    );

-- Create functions for auction management
CREATE OR REPLACE FUNCTION check_bid_validity()
RETURNS TRIGGER AS $$
DECLARE
    v_round auction_rounds;
    v_team teams;
    v_settings auction_settings;
    v_current_bid INTEGER;
BEGIN
    -- Get the auction round
    SELECT * INTO v_round
    FROM auction_rounds
    WHERE id = NEW.round_id;

    -- Check if auction is active
    IF v_round.status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Auction round is not active';
    END IF;

    -- Get the team
    SELECT * INTO v_team
    FROM teams
    WHERE id = NEW.team_id;

    -- Check team budget
    IF v_team.remaining_budget < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient team budget';
    END IF;

    -- Get auction settings
    SELECT * INTO v_settings
    FROM auction_settings
    WHERE tournament_id = v_round.tournament_id;

    -- Get current highest bid
    SELECT COALESCE(MAX(amount), v_round.starting_bid) INTO v_current_bid
    FROM bids
    WHERE round_id = NEW.round_id;

    -- Check minimum bid increment
    IF NEW.amount < (v_current_bid + v_settings.min_bid_increment) THEN
        RAISE EXCEPTION 'Bid amount must be at least % more than current bid', 
            v_settings.min_bid_increment;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_bid_before_insert
    BEFORE INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION check_bid_validity(); 