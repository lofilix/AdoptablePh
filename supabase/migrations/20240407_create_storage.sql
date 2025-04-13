-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('animal-images', 'animal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own images" ON storage.objects;

-- Allow public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'animal-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'animal-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'animal-images'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'animal-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'animal-images'
  AND auth.role() = 'authenticated'
); 