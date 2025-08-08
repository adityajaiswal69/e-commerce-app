-- Simple setup for background remover
-- Run this in your Supabase SQL Editor

-- Create removed_background_logs table
CREATE TABLE IF NOT EXISTS removed_background_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  old_url TEXT NOT NULL,
  new_url TEXT NOT NULL,
  removed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  image_name TEXT,
  tags TEXT[],
  category TEXT DEFAULT 'general',
  file_size INTEGER,
  dimensions TEXT,
  usage_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_user_id ON removed_background_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_is_public ON removed_background_logs(is_public);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_removed_at ON removed_background_logs(removed_at);

-- Enable RLS
ALTER TABLE removed_background_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own background removal logs" ON removed_background_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own background removal logs" ON removed_background_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own background removal logs" ON removed_background_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public can view public background removal logs" ON removed_background_logs
  FOR SELECT USING (is_public = true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'background-removed-images', 
  'background-removed-images', 
  true, 
  10485760,
  ARRAY['image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view background-removed images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'background-removed-images');

CREATE POLICY "Authenticated users can upload background-removed images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'background-removed-images' AND auth.role() = 'authenticated'); 