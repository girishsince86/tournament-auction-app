-- Create the tournament-media bucket for registration profile photos (and other tournament media).
-- Required for /api/tournaments/register/upload-image to work.
-- Run: supabase db push (or apply this migration on your hosted project).

INSERT INTO storage.buckets (id, name, public)
VALUES ('tournament-media', 'tournament-media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public read tournament-media" ON storage.objects;
DROP POLICY IF EXISTS "Public upload tournament-media" ON storage.objects;
DROP POLICY IF EXISTS "Public update tournament-media" ON storage.objects;
DROP POLICY IF EXISTS "Public delete tournament-media" ON storage.objects;

-- Allow public read access (for profile image URLs)
CREATE POLICY "Public read tournament-media"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tournament-media' );

-- Allow anyone to upload images (registration is public)
CREATE POLICY "Public upload tournament-media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'tournament-media'
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp'))
  AND length(name) < 200
  AND length(name) > 3
);

CREATE POLICY "Public update tournament-media"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'tournament-media' )
WITH CHECK ( bucket_id = 'tournament-media' );

CREATE POLICY "Public delete tournament-media"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'tournament-media' );
