-- Reference table for prior-year (2025) registrations used to pre-fill 2026 forms.
-- Lookup by email or phone_number.
CREATE TABLE IF NOT EXISTS registration_reference_2025 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_year integer NOT NULL DEFAULT 2025,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone_number text NOT NULL,
    date_of_birth date,
    category text NOT NULL,
    jersey_size text,
    jersey_number text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Allow lookup by email (multiple rows can share email e.g. family); prefer phone as unique.
CREATE INDEX IF NOT EXISTS idx_registration_reference_2025_email ON registration_reference_2025 (lower(email));
CREATE INDEX IF NOT EXISTS idx_registration_reference_2025_phone ON registration_reference_2025 (phone_number);

COMMENT ON TABLE registration_reference_2025 IS '2025 registration data for pre-filling 2026 forms; lookup by email or phone';

ALTER TABLE registration_reference_2025 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for reference lookup"
ON registration_reference_2025 FOR SELECT
TO public
USING (true);
