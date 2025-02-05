-- First, let's check all registrations with their creation timestamps
SELECT id, first_name, last_name, email, created_at 
FROM tournament_registrations 
ORDER BY created_at DESC;

-- Delete only test registrations (created before 5 PM IST today)
DELETE FROM tournament_registrations 
WHERE created_at < '2024-03-19 11:30:00+00:00'; -- 5 PM IST = 11:30 AM UTC

-- Verify remaining registrations
SELECT id, first_name, last_name, email, created_at 
FROM tournament_registrations 
ORDER BY created_at DESC; 