-- Add new fields to tournament_registrations table
ALTER TABLE tournament_registrations
ADD COLUMN email TEXT NOT NULL,
ADD COLUMN date_of_birth DATE,
ADD COLUMN parent_name TEXT,
ADD COLUMN parent_phone_number TEXT;

-- Add comments for documentation
COMMENT ON COLUMN tournament_registrations.email IS 'Email address of the participant';
COMMENT ON COLUMN tournament_registrations.date_of_birth IS 'Date of birth (required for youth categories)';
COMMENT ON COLUMN tournament_registrations.parent_name IS 'Parent/Guardian name (required for youth categories)';
COMMENT ON COLUMN tournament_registrations.parent_phone_number IS 'Parent/Guardian phone number (required for youth categories)';

-- Update existing rows with a default email (if any)
UPDATE tournament_registrations
SET email = CONCAT(first_name, '.', last_name, '@placeholder.com')
WHERE email IS NULL; 