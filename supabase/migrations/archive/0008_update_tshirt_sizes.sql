-- First, create backups of all affected tables
CREATE TABLE tournament_registrations_backup_sizes (
    LIKE tournament_registrations INCLUDING ALL
);

CREATE TABLE players_backup_sizes (
    LIKE players INCLUDING ALL
);

-- Backup the data
INSERT INTO tournament_registrations_backup_sizes
SELECT * FROM tournament_registrations;

INSERT INTO players_backup_sizes
SELECT * FROM players;

-- Drop the columns using the enum type
ALTER TABLE tournament_registrations DROP COLUMN tshirt_size;
ALTER TABLE players DROP COLUMN tshirt_size;
ALTER TABLE tournament_registrations_backup_sizes DROP COLUMN tshirt_size;

-- Now we can safely drop and recreate the enum
DROP TYPE IF EXISTS tshirt_size CASCADE;

-- Create the new enum type with updated values
CREATE TYPE tshirt_size AS ENUM (
    'XS',
    'S',
    'M',
    'L',
    'XL',
    '2XL',
    '3XL'
);

-- Add the column back to all tables with the new enum type
ALTER TABLE tournament_registrations
ADD COLUMN tshirt_size tshirt_size;

ALTER TABLE players
ADD COLUMN tshirt_size tshirt_size;

ALTER TABLE tournament_registrations_backup_sizes
ADD COLUMN tshirt_size tshirt_size;

-- Truncate the tables before restoring data
TRUNCATE TABLE tournament_registrations;
TRUNCATE TABLE players;

-- Restore data to tournament_registrations
INSERT INTO tournament_registrations (
    id, first_name, last_name, email, phone_number, flat_number,
    height, last_played_date, registration_category, registration_type,
    playing_positions, skill_level, tshirt_number, tshirt_name,
    payment_upi_id, payment_transaction_id, paid_to, is_verified,
    date_of_birth, parent_name, parent_phone_number,
    created_at, updated_at
)
SELECT 
    id, first_name, last_name, email, phone_number, flat_number,
    height, last_played_date, registration_category, registration_type,
    playing_positions, skill_level, tshirt_number, tshirt_name,
    payment_upi_id, payment_transaction_id, paid_to, is_verified,
    date_of_birth, parent_name, parent_phone_number,
    created_at, updated_at
FROM tournament_registrations_backup_sizes;

-- Restore data to players table
INSERT INTO players (
    id, first_name, last_name, email, phone_number, flat_number,
    height, skill_level, tshirt_number, tshirt_name,
    created_at, updated_at
)
SELECT 
    id, first_name, last_name, email, phone_number, flat_number,
    height, skill_level, tshirt_number, tshirt_name,
    created_at, updated_at
FROM players_backup_sizes;

-- Verify the updates
SELECT 'tournament_registrations' as table_name, COUNT(*) as count, array_agg(DISTINCT tshirt_size) as sizes 
FROM tournament_registrations
UNION ALL
SELECT 'players' as table_name, COUNT(*) as count, array_agg(DISTINCT tshirt_size) as sizes 
FROM players;

-- Optional: Drop the backup tables if everything is successful
-- DROP TABLE tournament_registrations_backup_sizes;
-- DROP TABLE players_backup_sizes; 