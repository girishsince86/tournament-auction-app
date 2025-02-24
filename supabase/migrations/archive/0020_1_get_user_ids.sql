-- Get user IDs for team owners
SELECT id, email
FROM auth.users
WHERE email IN ('owner1@pcvc.com', 'owner2@pcvc.com', 'owner3@pcvc.com'); 