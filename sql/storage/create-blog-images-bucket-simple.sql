-- Simple script to create the blog-images storage bucket
-- Run this in your Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images', 
  'blog-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Public can view blog images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'blog-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload blog images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can update blog images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated users can delete blog images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
