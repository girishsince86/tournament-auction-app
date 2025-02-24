-- Grant execute permission on the generate_profile_token function to authenticated users
GRANT EXECUTE ON FUNCTION generate_profile_token(uuid) TO authenticated;

-- Grant execute permission on the validate_profile_token function to authenticated users
GRANT EXECUTE ON FUNCTION validate_profile_token(text) TO authenticated;

-- Grant usage on the digest function to authenticated users (needed for token generation)
GRANT EXECUTE ON FUNCTION digest(text, text) TO authenticated;

-- Log the changes for verification
DO $$ 
BEGIN
  RAISE NOTICE 'Granted necessary permissions for profile token functions';
END $$; 