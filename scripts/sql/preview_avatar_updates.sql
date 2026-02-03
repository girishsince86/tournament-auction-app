-- Preview players that will be updated
SELECT 
    p.id, 
    p.name,
    'Player record will be updated' as update_type
FROM players p
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = p.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
AND (p.profile_image_url IS NULL OR p.profile_image_url = '')
ORDER BY p.name;

-- Preview tournament registrations that will be updated
SELECT 
    tr.id,
    tr.first_name || ' ' || tr.last_name as full_name,
    tr.registration_category,
    'Registration record will be updated' as update_type
FROM tournament_registrations tr
WHERE tr.registration_category::text LIKE 'VOLLEYBALL%'
AND (tr.profile_image_url IS NULL OR tr.profile_image_url = '')
ORDER BY full_name;

-- Count of records that will be updated
SELECT 
    'Players' as table_name,
    COUNT(*) as records_to_update
FROM players p
WHERE EXISTS (
    SELECT 1 FROM tournament_registrations tr 
    WHERE tr.id = p.id 
    AND tr.registration_category::text LIKE 'VOLLEYBALL%'
)
AND (p.profile_image_url IS NULL OR p.profile_image_url = '')

UNION ALL

SELECT 
    'Tournament Registrations' as table_name,
    COUNT(*) as records_to_update
FROM tournament_registrations tr
WHERE tr.registration_category::text LIKE 'VOLLEYBALL%'
AND (tr.profile_image_url IS NULL OR tr.profile_image_url = ''); 