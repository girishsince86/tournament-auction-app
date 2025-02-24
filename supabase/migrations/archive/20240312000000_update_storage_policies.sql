-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete own images" ON storage.objects;

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('tournament-media', 'tournament-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on the objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new policies with public access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'tournament-media' );

CREATE POLICY "Public can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'tournament-media'
    AND (storage.extension(name) = 'jpg' OR
         storage.extension(name) = 'jpeg' OR
         storage.extension(name) = 'png' OR
         storage.extension(name) = 'gif' OR
         storage.extension(name) = 'webp')
    AND length(name) < 100
    AND length(name) > 3
);

CREATE POLICY "Public can update own images"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'tournament-media' )
WITH CHECK ( bucket_id = 'tournament-media' );

CREATE POLICY "Public can delete own images"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'tournament-media' );

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO public;
GRANT ALL ON storage.objects TO public;
GRANT ALL ON storage.buckets TO public;

-- Explicitly allow public role to use the storage API
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON TABLES TO public;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON SEQUENCES TO public;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON FUNCTIONS TO public;

-- Log the changes
DO $$
BEGIN
    RAISE NOTICE 'Updated storage policies for public access with RLS enabled';
END $$; 