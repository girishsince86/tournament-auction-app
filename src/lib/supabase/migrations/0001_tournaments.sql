-- Create tournament types
CREATE TYPE tournament_status AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE registration_category AS ENUM (
    'VOLLEYBALL_OPEN_MEN',
    'THROWBALL_WOMEN',
    'THROWBALL_13_17_MIXED',
    'THROWBALL_8_12_MIXED'
);

-- Create tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    status tournament_status NOT NULL DEFAULT 'DRAFT',
    max_teams INTEGER NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create tournament rules table
CREATE TABLE tournament_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    rule_text TEXT NOT NULL,
    rule_order INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create tournament registrations table
CREATE TABLE tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    category registration_category NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    flat_number TEXT NOT NULL,
    height INTEGER NOT NULL,
    last_played_date DATE,
    skill_level skill_level NOT NULL,
    tshirt_size tshirt_size NOT NULL,
    tshirt_name TEXT,
    tshirt_number TEXT,
    payment_upi_id TEXT NOT NULL,
    payment_transaction_id TEXT NOT NULL,
    paid_to TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_rules_updated_at
    BEFORE UPDATE ON tournament_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_registrations_updated_at
    BEFORE UPDATE ON tournament_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Tournaments are viewable by all"
    ON tournaments FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Tournament rules are viewable by all"
    ON tournament_rules FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Registrations are insertable by all"
    ON tournament_registrations FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

CREATE POLICY "Registrations are viewable by admin and conductors"
    ON tournament_registrations FOR SELECT
    USING (auth.jwt() ->> 'role' IN ('ADMIN', 'CONDUCTOR')); 