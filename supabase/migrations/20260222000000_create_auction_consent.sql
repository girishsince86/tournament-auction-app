-- Create auction_consent table for TB Open Women players
-- to capture their preference for auction pool vs spin-the-wheel

CREATE TABLE IF NOT EXISTS auction_consent (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id uuid NOT NULL REFERENCES tournament_registrations(id),
    player_name     text NOT NULL,
    phone_number    text NOT NULL,
    email           text,
    consent_choice  text NOT NULL CHECK (consent_choice IN ('AUCTION_POOL', 'SPIN_THE_WHEEL')),
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),
    CONSTRAINT auction_consent_registration_id_key UNIQUE(registration_id)
);

-- Enable RLS
ALTER TABLE auction_consent ENABLE ROW LEVEL SECURITY;

-- Public read access (so the page can check existing consent)
CREATE POLICY "Allow public to view consent"
ON auction_consent FOR SELECT
TO public
USING (true);

-- Public insert access (unauthenticated form submission)
CREATE POLICY "Allow public to insert consent"
ON auction_consent FOR INSERT
TO public
WITH CHECK (true);

-- Public update access (allow players to change their choice)
CREATE POLICY "Allow public to update consent"
ON auction_consent FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Reuse the existing updated_at trigger
CREATE TRIGGER update_auction_consent_updated_at
    BEFORE UPDATE ON auction_consent
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
