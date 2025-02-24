-- Update admin roles in user metadata
UPDATE auth.users
SET 
    raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{role}',
        '"admin"'
    ),
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        '"admin"'
    )
WHERE email LIKE '%@pbel.in';

-- Verify the update
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email LIKE '%@pbel.in' 
        AND (
            raw_user_meta_data->>'role' = 'admin' OR
            raw_app_meta_data->>'role' = 'admin'
        )
    ) THEN
        RAISE EXCEPTION 'Failed to update admin roles';
    END IF;
END $$;

-- Note: User must sign out and back in to receive a new token with the updated role

-- Rollback SQL
/*
UPDATE auth.users
SET 
    raw_app_meta_data = raw_app_meta_data - 'role',
    raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email LIKE '%@pbel.in';
*/ 