-- Create blog-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Set up RLS policies for blog-images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Admin can upload blog images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can update blog images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can delete blog images" ON storage.objects FOR DELETE 
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
