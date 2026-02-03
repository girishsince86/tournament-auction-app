-- tournament_registrations.playing_positions was player_position[] (SETTER, MIDDLE_BLOCKER, etc).
-- Registration form uses court positions: P1_RIGHT_BACK, P2_RIGHT_FRONT, P3_MIDDLE_FRONT, P4_LEFT_FRONT, P5_LEFT_BACK, P6_MIDDLE_BACK.
-- Use text[] so both formats are accepted.

ALTER TABLE tournament_registrations
  ALTER COLUMN playing_positions TYPE text[] USING playing_positions::text[];

COMMENT ON COLUMN tournament_registrations.playing_positions IS 'Court positions: P1_RIGHT_BACK, P2_RIGHT_FRONT, P3_MIDDLE_FRONT, P4_LEFT_FRONT, P5_LEFT_BACK, P6_MIDDLE_BACK';
