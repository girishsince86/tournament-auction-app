-- First, let's create a temporary table to hold our data
CREATE TEMP TABLE temp_player_updates (
    id UUID,
    registration_category VARCHAR
);

-- Insert the data from the spreadsheet
INSERT INTO temp_player_updates (id, registration_category) VALUES
('ab16d9c0-fd01-4c94-a873-8b27e88f5726', 'VOLLEYBALL_OPEN_MEN'),
('a728fd7c-c76a-40eb-9c25-0b61686b5e7', 'VOLLEYBALL_OPEN_MEN'),
('efc6b85b-6f5c-4cba-8e6c-f0baa82e529b', 'VOLLEYBALL_OPEN_MEN'),
('4eb10c79-d929-405c-bb71-156fd24e4ec7', 'VOLLEYBALL_OPEN_MEN'),
('f65fd332-5cec-4cff-9cab-a8545723c35', 'VOLLEYBALL_OPEN_MEN'),
('78a3959-a-e6f8-44dd-9dbc-0424251bac9', 'VOLLEYBALL_OPEN_MEN'),
('111ae69a-c2f4-44b5-b5a8-7ceb8a28b6c6', 'VOLLEYBALL_OPEN_MEN'),
('6d2d74da-c939-4f25-944d-dbffa702119', 'VOLLEYBALL_OPEN_MEN'),
('deea3e3d-95ed-4ab1-853c-e5dc08fe22', 'VOLLEYBALL_OPEN_MEN'),
('05d7972-c4a4-48eb-b1c1-19b204bd2ee', 'VOLLEYBALL_OPEN_MEN');

-- Update the players table with the new registration category
UPDATE players p
SET 
    registration_category = t.registration_category,
    updated_at = NOW()
FROM temp_player_updates t
WHERE p.id = t.id;

-- Drop the temporary table
DROP TABLE temp_player_updates;

-- Verify the updates
SELECT id, registration_category, updated_at 
FROM players 
WHERE id IN (
    'ab16d9c0-fd01-4c94-a873-8b27e88f5726',
    'a728fd7c-c76a-40eb-9c25-0b61686b5e7',
    'efc6b85b-6f5c-4cba-8e6c-f0baa82e529b',
    '4eb10c79-d929-405c-bb71-156fd24e4ec7',
    'f65fd332-5cec-4cff-9cab-a8545723c35',
    '78a3959-a-e6f8-44dd-9dbc-0424251bac9',
    '111ae69a-c2f4-44b5-b5a8-7ceb8a28b6c6',
    '6d2d74da-c939-4f25-944d-dbffa702119',
    'deea3e3d-95ed-4ab1-853c-e5dc08fe22',
    '05d7972-c4a4-48eb-b1c1-19b204bd2ee'
); 