# Background Remover Setup - Fix 500 Error

## Issue
You're getting a 500 Internal Server Error because the database table `removed_background_logs` doesn't exist yet.

## Quick Fix Steps

### 1. Create the Database Table
Go to your Supabase dashboard and run this SQL in the SQL Editor:

```sql
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
```

### 2. Create Storage Bucket
Also run this SQL to create the storage bucket:

```sql
-- Create background-removed-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'background-removed-images', 
  'background-removed-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for background-removed-images bucket
CREATE POLICY "Public can view background-removed images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'background-removed-images');

CREATE POLICY "Authenticated users can upload background-removed images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'background-removed-images' AND auth.role() = 'authenticated');
```

### 3. Add Environment Variable
Add this to your `.env.local` file:

```env
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
```

### 4. Test the API
After running the SQL, test the API endpoint:

```bash
curl "http://localhost:3000/api/background-removed-images?category=all&search=&limit=20&offset=0"
```

You should get a response like:
```json
{
  "success": true,
  "images": [],
  "total": 0,
  "hasMore": false
}
```

## What Each Step Does

1. **Database Table**: Creates the `removed_background_logs` table with all necessary fields
2. **Indexes**: Improves query performance for searching and filtering
3. **RLS Policies**: Controls who can view and modify the data
4. **Storage Bucket**: Creates the bucket for storing background-removed images
5. **Environment Variable**: Required for the remove.bg API

## Troubleshooting

If you still get errors:

1. **Check Supabase Logs**: Go to your Supabase dashboard → Logs to see detailed error messages
2. **Verify Table Exists**: Run `SELECT * FROM removed_background_logs LIMIT 1;` in SQL Editor
3. **Check RLS**: Make sure you're authenticated when testing the API
4. **Test with Simple Query**: Try `SELECT COUNT(*) FROM removed_background_logs;`

## Next Steps

Once the database is set up:

1. The "Browse Background Removed Images" button should work
2. You can start removing backgrounds from images
3. The processed images will be stored and available to all users
4. You can search and filter through the image library

Let me know if you need help with any of these steps! 