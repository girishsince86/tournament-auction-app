-- tournament_registrations uses DB enums that don't match the registration form values.
-- Form skill_level: RECREATIONAL_C, INTERMEDIATE_B, UPPER_INTERMEDIATE_BB, COMPETITIVE_A.
-- Form tshirt_size: XS, S, M, L, XL, 2XL, 3XL.
-- Use text so form values are accepted.

ALTER TABLE tournament_registrations
  ALTER COLUMN skill_level TYPE text USING skill_level::text;

ALTER TABLE tournament_registrations
  ALTER COLUMN tshirt_size TYPE text USING tshirt_size::text;

COMMENT ON COLUMN tournament_registrations.skill_level IS 'e.g. RECREATIONAL_C, INTERMEDIATE_B, UPPER_INTERMEDIATE_BB, COMPETITIVE_A';
COMMENT ON COLUMN tournament_registrations.tshirt_size IS 'e.g. XS, S, M, L, XL, 2XL, 3XL';
