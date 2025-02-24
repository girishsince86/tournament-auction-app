-- Insert default auction settings
INSERT INTO auction_settings (
    min_players_per_team,
    max_players_per_team,
    min_bid_increment,
    timer_duration_seconds,
    min_setters,
    min_outside_hitters,
    min_middle_blockers,
    min_opposites,
    min_liberos
) VALUES (
    7,  -- min_players_per_team
    14, -- max_players_per_team
    100000, -- min_bid_increment (1 lakh)
    30, -- timer_duration_seconds
    1,  -- min_setters
    2,  -- min_outside_hitters
    2,  -- min_middle_blockers
    1,  -- min_opposites
    1   -- min_liberos
) ON CONFLICT DO NOTHING;

-- Insert default tournament rules
INSERT INTO tournament_rules (rule_text, rule_order, is_active) VALUES
    ('Each team must have a minimum of 7 players and a maximum of 14 players.', 1, true),
    ('Teams must have at least 1 setter, 2 outside hitters, 2 middle blockers, 1 opposite, and 1 libero.', 2, true),
    ('Players can only be registered in one position.', 3, true),
    ('The minimum bid increment is ₹1,00,000.', 4, true),
    ('Teams cannot exceed their allocated budget.', 5, true),
    ('Players must meet the minimum skill level requirements for their registered position.', 6, true),
    ('Team owners can only bid for their own team.', 7, true),
    ('Once a player is drafted, they cannot be traded or released.', 8, true),
    ('All team composition requirements must be met by the end of the auction.', 9, true),
    ('The auction conductor has final authority on all decisions.', 10, true)
) ON CONFLICT DO NOTHING;

-- Insert default player categories for different tournaments
INSERT INTO player_categories (
    tournament_id,
    name,
    category_type,
    base_points,
    min_points,
    max_points,
    description,
    skill_level
) 
SELECT 
    t.id,
    'Elite',
    'LEVEL_1',
    400,
    300,
    500,
    'Top tier players with exceptional skills and experience',
    'COMPETITIVE_A'
FROM tournaments t
WHERE NOT EXISTS (
    SELECT 1 FROM player_categories pc 
    WHERE pc.tournament_id = t.id AND pc.name = 'Elite'
);

INSERT INTO player_categories (
    tournament_id,
    name,
    category_type,
    base_points,
    min_points,
    max_points,
    description,
    skill_level
) 
SELECT 
    t.id,
    'Advanced',
    'LEVEL_2',
    300,
    200,
    400,
    'Skilled players with good competitive experience',
    'COMPETITIVE_B'
FROM tournaments t
WHERE NOT EXISTS (
    SELECT 1 FROM player_categories pc 
    WHERE pc.tournament_id = t.id AND pc.name = 'Advanced'
);

INSERT INTO player_categories (
    tournament_id,
    name,
    category_type,
    base_points,
    min_points,
    max_points,
    description,
    skill_level
) 
SELECT 
    t.id,
    'Intermediate',
    'LEVEL_2',
    200,
    100,
    300,
    'Players with moderate competitive experience',
    'COMPETITIVE_C'
FROM tournaments t
WHERE NOT EXISTS (
    SELECT 1 FROM player_categories pc 
    WHERE pc.tournament_id = t.id AND pc.name = 'Intermediate'
);

-- Insert default auction display configuration for tournaments
INSERT INTO auction_display_config (
    tournament_id,
    initial_timer_seconds,
    subsequent_timer_seconds,
    first_call_seconds,
    second_call_seconds,
    final_call_seconds,
    enable_sound,
    enable_visual_effects
)
SELECT 
    t.id,
    30, -- initial_timer_seconds
    20, -- subsequent_timer_seconds
    10, -- first_call_seconds
    5,  -- second_call_seconds
    2,  -- final_call_seconds
    true, -- enable_sound
    true  -- enable_visual_effects
FROM tournaments t
WHERE NOT EXISTS (
    SELECT 1 FROM auction_display_config adc 
    WHERE adc.tournament_id = t.id
);

-- Create initial auction state if none exists
INSERT INTO auction_state (status, current_round)
SELECT 'WAITING', 0
WHERE NOT EXISTS (SELECT 1 FROM auction_state);

-- Function to ensure minimum team requirements
CREATE OR REPLACE FUNCTION ensure_team_requirements()
RETURNS void AS $$
BEGIN
    -- Insert default combined requirements for each team
    INSERT INTO team_combined_requirements (
        team_id,
        position,
        skill_level,
        min_players,
        max_players,
        current_count,
        points_allocated
    )
    SELECT 
        t.id,
        p.position,
        s.skill_level,
        CASE 
            WHEN p.position = 'SETTER' THEN 1
            WHEN p.position = 'OUTSIDE_HITTER' THEN 2
            WHEN p.position = 'MIDDLE_BLOCKER' THEN 2
            WHEN p.position = 'OPPOSITE' THEN 1
            WHEN p.position = 'LIBERO' THEN 1
        END as min_players,
        CASE 
            WHEN p.position = 'SETTER' THEN 2
            WHEN p.position = 'OUTSIDE_HITTER' THEN 4
            WHEN p.position = 'MIDDLE_BLOCKER' THEN 4
            WHEN p.position = 'OPPOSITE' THEN 2
            WHEN p.position = 'LIBERO' THEN 2
        END as max_players,
        0, -- current_count
        0  -- points_allocated
    FROM teams t
    CROSS JOIN (
        SELECT unnest(enum_range(NULL::player_position)) as position
    ) p
    CROSS JOIN (
        SELECT unnest(enum_range(NULL::skill_level)) as skill_level
    ) s
    WHERE NOT EXISTS (
        SELECT 1 
        FROM team_combined_requirements tcr 
        WHERE tcr.team_id = t.id 
        AND tcr.position = p.position 
        AND tcr.skill_level = s.skill_level
    );
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT ensure_team_requirements();

-- Drop the function as it's no longer needed
DROP FUNCTION ensure_team_requirements(); 