-- Insert sample tournament
INSERT INTO tournaments (id, name, description, start_date, end_date, registration_deadline, 
    max_teams, max_players_per_team, min_players_per_team, team_points_budget, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'PCVC Volley Ball and Throwball League 2025', 
    'Annual PCVC volleyball and throwball tournament', 
    '2025-01-01', '2025-02-28', '2024-12-15', 8, 12, 6, 1000, true);

-- Insert sample player categories
INSERT INTO player_categories (id, tournament_id, name, category_type, base_points, min_points, max_points, 
    description, skill_level)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
    'Elite Players', 'LEVEL_1', 200, 150, 300, 'Top tier players', 'COMPETITIVE_A'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 
    'Advanced Players', 'LEVEL_2', 150, 100, 200, 'Advanced level players', 'UPPER_INTERMEDIATE_BB'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 
    'Intermediate Players', 'LEVEL_3', 100, 50, 150, 'Intermediate level players', 'INTERMEDIATE_B'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 
    'Development Players', 'LEVEL_4', 50, 25, 100, 'Development level players', 'RECREATIONAL_C');

-- Insert sample teams
INSERT INTO teams (id, name, owner_name, owner_id, initial_budget, remaining_budget, max_players)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'Thunderbolts', 
    'owner1@pcvc.com', (SELECT id FROM auth.users WHERE email = 'owner1@pcvc.com'), 1000, 1000, 12),
    ('44444444-4444-4444-4444-444444444444', 'Hurricanes', 
    'owner2@pcvc.com', (SELECT id FROM auth.users WHERE email = 'owner2@pcvc.com'), 1000, 1000, 12),
    ('55555555-5555-5555-5555-555555555555', 'Lightning', 
    'owner3@pcvc.com', (SELECT id FROM auth.users WHERE email = 'owner3@pcvc.com'), 1000, 1000, 12);

-- Insert team position requirements
INSERT INTO team_position_requirements (team_id, position, min_players, max_players)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'P1_RIGHT_BACK', 1, 2),
    ('33333333-3333-3333-3333-333333333333', 'P2_RIGHT_FRONT', 1, 2),
    ('33333333-3333-3333-3333-333333333333', 'P3_MIDDLE_FRONT', 1, 2),
    ('44444444-4444-4444-4444-444444444444', 'P4_LEFT_FRONT', 1, 2),
    ('44444444-4444-4444-4444-444444444444', 'P5_LEFT_BACK', 1, 2),
    ('44444444-4444-4444-4444-444444444444', 'P6_MIDDLE_BACK', 1, 2);

-- Insert team skill requirements
INSERT INTO team_skill_requirements (team_id, skill_level, min_players, max_players)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'COMPETITIVE_A', 2, 4),
    ('33333333-3333-3333-3333-333333333333', 'UPPER_INTERMEDIATE_BB', 2, 4),
    ('44444444-4444-4444-4444-444444444444', 'INTERMEDIATE_B', 2, 4),
    ('44444444-4444-4444-4444-444444444444', 'RECREATIONAL_C', 2, 4);

-- Insert sample players
INSERT INTO players (id, name, age, player_position, base_price, status, phone_number, 
    apartment_number, tshirt_size, skill_level, height, experience, category_id)
VALUES
    ('66666666-6666-6666-6666-666666666666', 'Balaji', 28, 'P1_RIGHT_BACK', 200, 
    'UNALLOCATED', '1234567890', 'A101', 'L', 'COMPETITIVE_A', 185, 8, 
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    
    ('77777777-7777-7777-7777-777777777777', 'Amarbir', 26, 'P4_LEFT_FRONT', 180, 
    'UNALLOCATED', '0987654321', 'B202', 'XL', 'UPPER_INTERMEDIATE_BB', 182, 5,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),

    -- New players
    ('88888888-8888-8888-8888-888888888888', 'Vasu', 30, 'P2_RIGHT_FRONT', 190,
    'UNALLOCATED', '9876543210', 'C303', 'L', 'COMPETITIVE_A', 180, 7,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

    ('99999999-9999-9999-9999-999999999999', 'Raghu', 25, 'P3_MIDDLE_FRONT', 160,
    'UNALLOCATED', '8765432109', 'D404', 'M', 'UPPER_INTERMEDIATE_BB', 175, 4,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),

    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Sudhakar', 32, 'P5_LEFT_BACK', 170,
    'UNALLOCATED', '7654321098', 'E505', 'XL', 'INTERMEDIATE_B', 178, 6,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'),

    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 'Amit', 28, 'P6_MIDDLE_BACK', 150,
    'UNALLOCATED', '6543210987', 'F606', 'L', 'INTERMEDIATE_B', 172, 3,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'),

    ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'Girish', 29, 'P1_RIGHT_BACK', 140,
    'UNALLOCATED', '5432109876', 'G707', 'M', 'RECREATIONAL_C', 176, 2,
    'dddddddd-dddd-dddd-dddd-dddddddddddd');

-- Insert player achievements
INSERT INTO player_achievements (player_id, tournament_name, achievement_type, title, description, achievement_date)
VALUES
    ('66666666-6666-6666-6666-666666666666', 'PCVC League 2023', 'AWARD', 
    'Best Spiker', 'Highest spike success rate', '2023-04-15'),
    ('77777777-7777-7777-7777-777777777777', 'PCVC Winter League 2023', 'RECOGNITION', 
    'Team MVP', 'Most Valuable Player', '2023-12-20');

-- Insert tournament players
INSERT INTO tournament_players (tournament_id, player_id)
VALUES
    ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666'),
    ('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777');

-- Insert auction display config
INSERT INTO auction_display_config (tournament_id, initial_timer_seconds, subsequent_timer_seconds,
    first_call_seconds, second_call_seconds, final_call_seconds)
VALUES
    ('11111111-1111-1111-1111-111111111111', 30, 20, 10, 5, 2);

-- Insert auction rounds
INSERT INTO auction_rounds (id, player_id, status, starting_price, final_points, 
    is_manual_entry, display_sequence, auction_date, conductor_notes)
VALUES
    ('88888888-8888-8888-8888-888888888888', 
    '66666666-6666-6666-6666-666666666666',
    'NOT_STARTED', 200, NULL, false, 1, CURRENT_DATE,
    'First round auction for Balaji'),
    
    ('99999999-9999-9999-9999-999999999999',
    '77777777-7777-7777-7777-777777777777',
    'NOT_STARTED', 180, NULL, false, 2, CURRENT_DATE,
    'First round auction for Amarbir');

-- Insert sample auction queue
INSERT INTO auction_queue (id, tournament_id, player_id, queue_position, is_processed)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    '66666666-6666-6666-6666-666666666666',
    1,
    false),
    
    ('ffffffff-ffff-ffff-ffff-ffffffffffff',
    '11111111-1111-1111-1111-111111111111',
    '77777777-7777-7777-7777-777777777777',
    2,
    false);

-- Rollback SQL
/*
DELETE FROM auction_queue;
DELETE FROM auction_rounds;
DELETE FROM auction_display_config;
DELETE FROM player_achievements;
DELETE FROM players;
DELETE FROM team_skill_requirements;
DELETE FROM team_position_requirements;
DELETE FROM teams;
DELETE FROM player_categories;
DELETE FROM tournaments;
*/ 