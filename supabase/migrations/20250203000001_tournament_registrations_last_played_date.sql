-- Add last_played_date column used by the registration form.
-- Values: PLAYING_ACTIVELY, NOT_PLAYED_SINCE_LAST_YEAR, NOT_PLAYED_IN_FEW_YEARS

ALTER TABLE tournament_registrations
  ADD COLUMN IF NOT EXISTS last_played_date text;

COMMENT ON COLUMN tournament_registrations.last_played_date IS 'Last played status: PLAYING_ACTIVELY, NOT_PLAYED_SINCE_LAST_YEAR, NOT_PLAYED_IN_FEW_YEARS';
