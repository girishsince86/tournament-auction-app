-- Drop the trigger
DROP TRIGGER IF EXISTS validate_last_played_date_trigger ON tournament_registrations;

-- Drop the validation function
DROP FUNCTION IF EXISTS validate_last_played_date();

-- Add a new date column
ALTER TABLE tournament_registrations
ADD COLUMN last_played_date_old DATE;

-- Convert enum values back to dates (using current date as reference)
UPDATE tournament_registrations
SET last_played_date_old = CASE
  WHEN last_played_date = 'PLAYING_ACTIVELY' THEN CURRENT_DATE
  WHEN last_played_date = 'NOT_PLAYED_SINCE_LAST_YEAR' THEN CURRENT_DATE - INTERVAL '1 year'
  WHEN last_played_date = 'NOT_PLAYED_IN_FEW_YEARS' THEN CURRENT_DATE - INTERVAL '3 years'
  ELSE NULL
END;

-- Drop the enum column
ALTER TABLE tournament_registrations
DROP COLUMN last_played_date;

-- Rename the date column back
ALTER TABLE tournament_registrations
RENAME COLUMN last_played_date_old TO last_played_date;

-- Drop the enum type
DROP TYPE IF EXISTS last_played_status; 