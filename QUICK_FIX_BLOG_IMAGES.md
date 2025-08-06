# Quick Fix for Blog Post Saving Error

## Problem
You're getting an error when saving blog posts, likely due to the image upload functionality trying to access a storage bucket that doesn't exist yet.

## Immediate Solution

### Option 1: Create the Storage Bucket (Recommended)

1. **Go to your Supabase Dashboard**
2. **Navigate to Storage**
3. **Run this SQL in the SQL Editor:**

```sql
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
```

### Option 2: Use Manual Image URLs Only

If you don't want to set up image upload right now, you can:

1. **Skip the "Choose Image" button**
2. **Use the manual URL input field** to enter image URLs from external sources
3. **The form will work normally** without trying to upload files

## What I've Fixed

1. **Better Error Handling**: The form now handles storage errors gracefully
2. **Fallback Behavior**: If image upload fails, the blog post still saves (without the image)
3. **Clear Error Messages**: You'll see specific error messages about what went wrong
4. **User Guidance**: Added notes in the form about the storage setup

## Testing

After running the SQL script:

1. **Try creating a new blog post**
2. **Upload an image using "Choose Image"**
3. **The image should upload successfully**
4. **The blog post should save with the image URL**

## Verification

To verify the bucket was created:

1. **Go to Supabase Dashboard > Storage**
2. **You should see a "blog-images" bucket**
3. **It should be marked as "Public"**

## If You Still Get Errors

1. **Check the browser console** for specific error messages
2. **Verify you're logged in** as an authenticated user
3. **Check that your Supabase project** has storage enabled
4. **Try using manual image URLs** as a temporary workaround

The form is now resilient and will work even if storage setup isn't complete!
