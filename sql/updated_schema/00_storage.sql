-- =====================================================
-- STORAGE SETUP
-- =====================================================
-- Storage buckets and policies for the e-commerce app
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequences for order numbers (prevents race conditions)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create storage buckets for various image types
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true),
('design-images', 'design-images', true),
('art-assets', 'art-assets', true),
('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Product images storage policies
CREATE POLICY "Public Access to product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND auth.role() = 'authenticated'
  );

-- Design images storage policies
CREATE POLICY "Public Access to design images" ON storage.objects
  FOR SELECT USING (bucket_id = 'design-images');

CREATE POLICY "Authenticated users can upload design images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'design-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own design images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'design-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own design images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'design-images' AND auth.role() = 'authenticated'
  );

-- Art assets storage policies
CREATE POLICY "Public read for art-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'art-assets');

CREATE POLICY "Authenticated upload to art-assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'art-assets');

-- Blog images storage policies
CREATE POLICY "Public Access to blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images' AND auth.role() = 'authenticated'
  ); 