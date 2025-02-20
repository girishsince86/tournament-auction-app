-- Drop the unique constraint on email
ALTER TABLE tournament_registrations DROP CONSTRAINT IF EXISTS tournament_registrations_email_key;

-- Add comment to explain why this was done
COMMENT ON COLUMN tournament_registrations.email IS 'Email address - Multiple registrations allowed per email to support parent registering multiple children'; 