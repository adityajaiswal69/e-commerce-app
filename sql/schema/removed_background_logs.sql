-- Create removed_background_logs table for tracking background removal actions
CREATE TABLE IF NOT EXISTS removed_background_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  old_url TEXT NOT NULL,
  new_url TEXT NOT NULL,
  removed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- New fields for reusable images
  is_public BOOLEAN DEFAULT false, -- Whether the image can be used by others
  image_name TEXT, -- Human-readable name for the image
  tags TEXT[], -- Array of tags for categorization
  category TEXT DEFAULT 'general', -- Category like 'animals', 'objects', 'people', etc.
  file_size INTEGER, -- Size of the processed image in bytes
  dimensions TEXT, -- Width x Height of the processed image
  usage_count INTEGER DEFAULT 0 -- How many times this image has been used
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_user_id ON removed_background_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_removed_at ON removed_background_logs(removed_at);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_is_public ON removed_background_logs(is_public);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_category ON removed_background_logs(category);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_tags ON removed_background_logs USING GIN(tags);

-- Enable RLS
ALTER TABLE removed_background_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own background removal logs
CREATE POLICY "Users can view their own background removal logs" ON removed_background_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own background removal logs
CREATE POLICY "Users can insert their own background removal logs" ON removed_background_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own background removal logs (for usage_count, etc.)
CREATE POLICY "Users can update their own background removal logs" ON removed_background_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Everyone can view public background-removed images
CREATE POLICY "Public can view public background removal logs" ON removed_background_logs
  FOR SELECT USING (is_public = true);

-- Admins can view all background removal logs
CREATE POLICY "Admins can view all background removal logs" ON removed_background_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all background removal logs
CREATE POLICY "Admins can update all background removal logs" ON removed_background_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE removed_background_logs IS 'Logs background removal actions and stores reusable processed images';
COMMENT ON COLUMN removed_background_logs.bucket IS 'Name of the Supabase storage bucket';
COMMENT ON COLUMN removed_background_logs.path IS 'File path within the bucket';
COMMENT ON COLUMN removed_background_logs.old_url IS 'Original image URL before background removal';
COMMENT ON COLUMN removed_background_logs.new_url IS 'New image URL after background removal';
COMMENT ON COLUMN removed_background_logs.removed_at IS 'Timestamp when background was removed';
COMMENT ON COLUMN removed_background_logs.user_id IS 'User who performed the background removal';
COMMENT ON COLUMN removed_background_logs.is_public IS 'Whether the processed image can be used by other users';
COMMENT ON COLUMN removed_background_logs.image_name IS 'Human-readable name for the processed image';
COMMENT ON COLUMN removed_background_logs.tags IS 'Array of tags for categorizing the image';
COMMENT ON COLUMN removed_background_logs.category IS 'Category of the image (animals, objects, people, etc.)';
COMMENT ON COLUMN removed_background_logs.file_size IS 'Size of the processed image in bytes';
COMMENT ON COLUMN removed_background_logs.dimensions IS 'Width x Height of the processed image';
COMMENT ON COLUMN removed_background_logs.usage_count IS 'How many times this image has been used in designs'; 