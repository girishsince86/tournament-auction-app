-- First, let's check the available enum values
DO $$ 
DECLARE
  enum_values text;
BEGIN
  SELECT string_agg(enumlabel, ', ')
  FROM pg_enum
  WHERE enumtypid = 'user_role'::regtype
  INTO enum_values;
  
  RAISE NOTICE 'Available user_role enum values: %', enum_values;
END $$;

-- Update the admin user's role in auth.users
UPDATE auth.users
SET raw_app_meta_data = 
  raw_app_meta_data || 
  '{"role": "admin"}'::jsonb
WHERE email = 'admin@pbel.in';

-- Update the role in the users table if it exists
DO $$ 
DECLARE
  role_exists boolean;
BEGIN
  -- Check if the role value exists in the enum
  SELECT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'user_role'::regtype
    AND enumlabel = 'ADMIN'
  ) INTO role_exists;

  IF role_exists THEN
    -- Only attempt update if the role value exists
    UPDATE users
    SET role = 'ADMIN'::user_role
    WHERE email = 'admin@pbel.in';
  ELSE
    RAISE NOTICE 'ADMIN role value does not exist in user_role enum. Please check the available values in the notice above.';
  END IF;
END $$;

-- Note: After running this SQL, you need to:
-- 1. Sign out of your application
-- 2. Sign back in to get a new token with the updated role 