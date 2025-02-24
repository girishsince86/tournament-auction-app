-- Sample data for preferred players using existing data

-- Add preferred players for Thunder Spikers
INSERT INTO preferred_players (team_id, player_id, priority, notes, created_at, updated_at)
SELECT 
    t.id as team_id,
    p.id as player_id,
    priority,
    notes,
    NOW(),
    NOW()
FROM (
    SELECT 'Thunder Spikers' as team_name, p.name as player_name, priority, notes
    FROM (VALUES
        ('Rahul Kumar', 1, 'Strong defensive skills'),
        ('Arun Verma', 2, 'Excellent setter'),
        ('Raj Sharma', 3, 'Powerful spiker'),
        ('Deepak Chopra', 4, 'Good game reading')
    ) as p(name, priority, notes)
) as preferences
JOIN teams t ON t.name = preferences.team_name
JOIN players p ON p.name = preferences.player_name
ON CONFLICT (team_id, player_id) DO UPDATE SET
    priority = EXCLUDED.priority,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- Add preferred players for Velocity Volley
INSERT INTO preferred_players (team_id, player_id, priority, notes, created_at, updated_at)
SELECT 
    t.id as team_id,
    p.id as player_id,
    priority,
    notes,
    NOW(),
    NOW()
FROM (
    SELECT 'Velocity Volley' as team_name, p.name as player_name, priority, notes
    FROM (VALUES
        ('Suresh Patel', 1, 'Strong blocker'),
        ('Nikhil Reddy', 2, 'Consistent hitter'),
        ('Pradeep Kumar', 3, 'Great serve receive'),
        ('Karan Malhotra', 4, 'Quick setter')
    ) as p(name, priority, notes)
) as preferences
JOIN teams t ON t.name = preferences.team_name
JOIN players p ON p.name = preferences.player_name
ON CONFLICT (team_id, player_id) DO UPDATE SET
    priority = EXCLUDED.priority,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- Add preferred players for Power Hitters
INSERT INTO preferred_players (team_id, player_id, priority, notes, created_at, updated_at)
SELECT 
    t.id as team_id,
    p.id as player_id,
    priority,
    notes,
    NOW(),
    NOW()
FROM (
    SELECT 'Power Hitters' as team_name, p.name as player_name, priority, notes
    FROM (VALUES
        ('Raj Sharma', 1, 'Top spiker'),
        ('Vikram Shah', 2, 'Good blocking technique'),
        ('Ajay Mathur', 3, 'Solid defense'),
        ('Amit Singh', 4, 'Reliable back row')
    ) as p(name, priority, notes)
) as preferences
JOIN teams t ON t.name = preferences.team_name
JOIN players p ON p.name = preferences.player_name
ON CONFLICT (team_id, player_id) DO UPDATE SET
    priority = EXCLUDED.priority,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- Rollback SQL
/*
DELETE FROM preferred_players;
*/ 