-- tournament_registrations.registration_category was incorrectly typed as category_type (LEVEL_1, LEVEL_2, LEVEL_3).
-- The app uses registration categories like VOLLEYBALL_OPEN_MEN, THROWBALL_WOMEN, etc.
-- Change column to TEXT so it accepts these values.

ALTER TABLE tournament_registrations
  ALTER COLUMN registration_category TYPE text USING registration_category::text;

COMMENT ON COLUMN tournament_registrations.registration_category IS 'Registration category: VOLLEYBALL_OPEN_MEN, THROWBALL_WOMEN, THROWBALL_13_17_MIXED, THROWBALL_8_12_MIXED';
