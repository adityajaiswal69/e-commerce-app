-- Drop existing storage policies for the designs bucket
DROP POLICY IF EXISTS "Anyone can view designs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload designs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own designs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own designs" ON storage.objects;

-- Create new storage policies with proper public access and folder structure
CREATE POLICY "Public read access for design images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'designs' AND position('public/' in name) = 1);

CREATE POLICY "Authenticated users can read their private designs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'designs' 
        AND (
            position('public/' in name) = 1 
            OR auth.uid()::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Authenticated users can upload designs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'designs'
        AND (
            position('public/' in name) = 1 
            OR auth.uid()::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Users can update their own designs"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'designs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'designs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own designs"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'designs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Add an additional public folder policy
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'designs_public',
    'designs_public',
    true,
    5242880,
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];
