-- Insert preferred players for teams
INSERT INTO preferred_players (team_id, player_id, priority, max_bid, notes)
VALUES
  -- Thunderbolts Preferences (COMPETITIVE_A players)
  ('33333333-3333-3333-3333-333333333333', '79436d0a-762b-4a71-a213-067c94734b7f', 1, 300, 'Strong middle back player with competitive skill level'),
  ('33333333-3333-3333-3333-333333333333', '4ea6b549-2172-4b39-95bb-ea62ab71da57', 2, 280, 'Versatile player with competitive skill level'),
  ('33333333-3333-3333-3333-333333333333', 'c565a44e-8955-4dfd-a6af-d52928f68db0', 3, 270, 'Strong left front attacker'),
  ('33333333-3333-3333-3333-333333333333', 'fc965872-0e32-4251-b2fc-db533d583211', 4, 260, 'Versatile player with good adaptability'),
  ('33333333-3333-3333-3333-333333333333', '646da9f0-7fa7-41c6-92f4-c6a5cf023d3a', 5, 250, 'Experienced all-rounder'),

  -- Hurricanes Preferences (UPPER_INTERMEDIATE_BB players)
  ('44444444-4444-4444-4444-444444444444', 'f144c374-7178-46d1-8375-7e7a5b227188', 1, 250, 'Competitive middle back specialist'),
  ('44444444-4444-4444-4444-444444444444', 'a5a47096-6674-46a7-a47d-339abe3b195c', 2, 240, 'Strong right back player'),
  ('44444444-4444-4444-4444-444444444444', '0b7ca981-ba1c-4222-8f62-d3b4def99e63', 3, 230, 'Experienced middle back player'),
  ('44444444-4444-4444-4444-444444444444', '19f58f4f-c8c7-44cd-b6af-442282f3101a', 4, 220, 'Skilled left front attacker'),
  ('44444444-4444-4444-4444-444444444444', '7e253dd9-6c49-49ef-89c7-534837a543cd', 5, 200, 'Versatile player with good experience'),

  -- Lightning Preferences (Mix of skill levels)
  ('55555555-5555-5555-5555-555555555555', 'a669a136-be57-4be1-bd02-24e65fc0148f', 1, 300, 'Top middle back player'),
  ('55555555-5555-5555-5555-555555555555', '61abc1e5-63e1-4e82-9fe3-74b34623001c', 2, 250, 'Strong middle front specialist'),
  ('55555555-5555-5555-5555-555555555555', 'bdaa2414-ab71-4211-9717-8e1182a19453', 3, 200, 'Skilled left front attacker'),
  ('55555555-5555-5555-5555-555555555555', '5606c7e2-0089-45f3-8830-4437c158a990', 4, 180, 'Experienced middle back player'),
  ('55555555-5555-5555-5555-555555555555', 'e4687aef-b1a8-4bba-9ba4-319a2972d29a', 5, 150, 'Strong middle front player');

-- Create view for team budget analysis
CREATE OR REPLACE VIEW team_budget_analysis AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.initial_budget,
    t.remaining_budget,
    COUNT(pp.player_id) as number_of_preferred_players,
    COALESCE(SUM(
        CASE p.skill_level
            WHEN 'COMPETITIVE_A' THEN 250
            WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
            WHEN 'INTERMEDIATE_B' THEN 150
            WHEN 'RECREATIONAL_C' THEN 100
            ELSE 100
        END
    ), 0) as total_preferred_points,
    t.initial_budget - COALESCE(SUM(
        CASE p.skill_level
            WHEN 'COMPETITIVE_A' THEN 250
            WHEN 'UPPER_INTERMEDIATE_BB' THEN 200
            WHEN 'INTERMEDIATE_B' THEN 150
            WHEN 'RECREATIONAL_C' THEN 100
            ELSE 100
        END
    ), 0) as potential_remaining_budget
FROM teams t
LEFT JOIN preferred_players pp ON pp.team_id = t.id
LEFT JOIN players p ON p.id = pp.player_id
WHERE t.tournament_id = '11111111-1111-1111-1111-111111111111'
GROUP BY t.id, t.name, t.initial_budget, t.remaining_budget; 