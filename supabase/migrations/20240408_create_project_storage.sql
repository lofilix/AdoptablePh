-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view project images
CREATE POLICY "Public can view project images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'project-images'
);

-- Allow authenticated users to upload project images
CREATE POLICY "Users can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own project images
CREATE POLICY "Users can update their own project images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their own project images
CREATE POLICY "Users can delete their own project images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
); 