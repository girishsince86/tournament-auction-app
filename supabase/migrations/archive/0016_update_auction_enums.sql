-- Update player status enum
ALTER TYPE player_status RENAME VALUE 'SOLD' TO 'ALLOCATED';
ALTER TYPE player_status RENAME VALUE 'UNSOLD' TO 'UNALLOCATED';

-- Create new enum for player category types
CREATE TYPE player_category_type AS ENUM (
    'LEVEL_1',  -- Highest level
    'LEVEL_2',
    'LEVEL_3',
    'LEVEL_4'   -- Development level
);

-- Create new enum for achievement types
CREATE TYPE achievement_type AS ENUM (
    'AWARD',
    'RECOGNITION',
    'PARTICIPATION',
    'CERTIFICATION'
);

-- Rollback SQL
-- ALTER TYPE player_status RENAME VALUE 'ALLOCATED' TO 'SOLD';
-- ALTER TYPE player_status RENAME VALUE 'UNALLOCATED' TO 'UNSOLD';
-- DROP TYPE IF EXISTS player_category_type;
-- DROP TYPE IF EXISTS achievement_type; 