-- Create the enum type for last played status
CREATE TYPE last_played_status AS ENUM (
  'PLAYING_ACTIVELY',
  'NOT_PLAYED_SINCE_LAST_YEAR',
  'NOT_PLAYED_IN_FEW_YEARS'
);

-- First, add a new column with the enum type
ALTER TABLE tournament_registrations
ADD COLUMN last_played_status last_played_status;

-- Update the new column based on existing data (optional, adjust the logic as needed)
UPDATE tournament_registrations
SET last_played_status = 'PLAYING_ACTIVELY'
WHERE last_played_date >= NOW() - INTERVAL '1 year';

UPDATE tournament_registrations
SET last_played_status = 'NOT_PLAYED_SINCE_LAST_YEAR'
WHERE last_played_date < NOW() - INTERVAL '1 year'
  AND last_played_date >= NOW() - INTERVAL '2 years';

UPDATE tournament_registrations
SET last_played_status = 'NOT_PLAYED_IN_FEW_YEARS'
WHERE last_played_date < NOW() - INTERVAL '2 years'
  OR last_played_date IS NULL;

-- Drop the old column
ALTER TABLE tournament_registrations
DROP COLUMN last_played_date;

-- Rename the new column to last_played_date
ALTER TABLE tournament_registrations
RENAME COLUMN last_played_status TO last_played_date;

-- Add NOT NULL constraint
ALTER TABLE tournament_registrations
ALTER COLUMN last_played_date SET NOT NULL;

-- Add comment to explain the enum values
COMMENT ON COLUMN tournament_registrations.last_played_date IS 'Player''s last played status: PLAYING_ACTIVELY, NOT_PLAYED_SINCE_LAST_YEAR, or NOT_PLAYED_IN_FEW_YEARS';

-- Create a function to validate the last_played_date
CREATE OR REPLACE FUNCTION validate_last_played_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_played_date IS NULL THEN
    RAISE EXCEPTION 'last_played_date cannot be null';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to enforce validation
CREATE TRIGGER validate_last_played_date_trigger
BEFORE INSERT OR UPDATE ON tournament_registrations
FOR EACH ROW
EXECUTE FUNCTION validate_last_played_date();

-- Add RLS policies (if needed)
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY; 