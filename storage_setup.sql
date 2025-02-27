-- Drop existing policies if they exist
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create or update the bucket with exact name match
DO $$
BEGIN
    -- Drop the bucket if it exists
    DROP BUCKET IF EXISTS team_owner_images;
    
    -- Create the bucket with the exact name
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('team-owner-images', 'team-owner-images', true)
    ON CONFLICT (id) DO UPDATE
    SET 
        public = true,
        file_size_limit = 5242880, -- 5MB
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

    -- Set CORS policy
    UPDATE storage.buckets
    SET cors_rules = '[
        {
            "origin": "*",
            "methods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
            "headers": ["Authorization", "Content-Type", "Content-Length", "Cache-Control", "x-upsert"],
            "maxAgeSeconds": 3600,
            "expose": ["Content-Range", "Content-Length", "ETag"]
        }
    ]'::jsonb
    WHERE id = 'team-owner-images';
END $$;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies with exact bucket name match
DO $$
BEGIN
    -- Public read access
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'team-owner-images');

    -- Authenticated users can upload
    CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'team-owner-images'
        AND auth.role() = 'authenticated'
    );

    -- Users can update their own files
    CREATE POLICY "Users can update own files"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'team-owner-images'
        AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
    );

    -- Users can delete their own files
    CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'team-owner-images'
        AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
    );
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$; 