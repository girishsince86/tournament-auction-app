-- Check if the table exists and its structure
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'tournament_registrations'
);

-- Get table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'tournament_registrations';

-- Count all records without any filters
SELECT COUNT(*) as total_count
FROM tournament_registrations;

-- Sample some records (first 5)
SELECT id, registration_category, created_at, is_verified
FROM tournament_registrations
LIMIT 5;

-- Check table owner and permissions
SELECT 
    schemaname, 
    tablename, 
    tableowner, 
    tablespace,
    hasindexes, 
    hasrules, 
    hastriggers
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'tournament_registrations';

-- Check if RLS is enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE oid = 'public.tournament_registrations'::regclass; 