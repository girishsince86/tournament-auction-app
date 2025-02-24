-- Get table definitions
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.column_default,
    c.is_nullable,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale,
    c.udt_name,
    tc.constraint_type,
    cc.constraint_name,
    cc.check_clause
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name
LEFT JOIN information_schema.table_constraints tc 
    ON t.table_name = tc.table_name
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND t.table_name IN (
    'auction_rounds',
    'auction_display_config',
    'players',
    'teams',
    'player_categories',
    'team_position_requirements',
    'team_skill_requirements',
    'player_achievements',
    'player_statistics'
)
ORDER BY t.table_name, c.ordinal_position; 