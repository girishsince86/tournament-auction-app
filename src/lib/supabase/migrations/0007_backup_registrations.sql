-- Create a backup table with timestamp
CREATE TABLE tournament_registrations_backup_20240319 (
    LIKE tournament_registrations INCLUDING ALL
);

-- Copy all data from the original table to the backup table
INSERT INTO tournament_registrations_backup_20240319
SELECT * FROM tournament_registrations;

-- Verify the backup
SELECT 
    'Original table' as source, COUNT(*) as count 
FROM tournament_registrations
UNION ALL
SELECT 
    'Backup table' as source, COUNT(*) as count 
FROM tournament_registrations_backup_20240319;

-- Show sample data from backup to verify
SELECT id, first_name, last_name, email, created_at 
FROM tournament_registrations_backup_20240319 
ORDER BY created_at DESC; 