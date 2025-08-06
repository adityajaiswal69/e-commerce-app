# Blog Image Upload Setup

This document explains the blog image upload functionality that has been implemented in the BlogPostForm component.

## Features Implemented

### 1. Image Upload to Supabase Storage
- **File Selection**: Users can select image files using a file input
- **Image Preview**: Shows preview of selected image before upload
- **Automatic Upload**: Images are uploaded to Supabase storage when saving blog posts
- **URL Generation**: Automatically generates and stores the public URL in the database

### 2. Image Management
- **Replace Images**: When editing a blog post, selecting a new image will replace the old one
- **Manual URL Input**: Fallback option to enter image URLs manually
- **Image Deletion**: Automatic cleanup when blog posts are deleted

### 3. Storage Structure
- **Bucket**: `blog-images` (public bucket)
- **File Naming**: UUID-based filenames to prevent conflicts
- **Path Structure**: `blog-images/{uuid}.{extension}`

## Setup Instructions

### 1. Create Storage Bucket
Run the following SQL in your Supabase SQL editor:

```sql
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
```

### 2. Set Up Automatic Image Deletion
Run this SQL to create a trigger that automatically deletes images when blog posts are deleted:

```sql
-- Function to delete blog image from storage when blog post is deleted
CREATE OR REPLACE FUNCTION delete_blog_image_on_post_delete()
RETURNS TRIGGER AS $$
DECLARE
    image_path TEXT;
BEGIN
    -- Extract the image path from the URL if it exists
    IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
        -- Extract path from Supabase storage URL
        IF OLD.image_url LIKE '%/storage/v1/object/public/blog-images/%' THEN
            image_path := SUBSTRING(OLD.image_url FROM '.*/storage/v1/object/public/blog-images/(.*)');
            
            -- Delete the file from storage
            PERFORM storage.delete_object('blog-images', image_path);
        END IF;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_delete_blog_image ON blog_posts;
CREATE TRIGGER trigger_delete_blog_image
    BEFORE DELETE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION delete_blog_image_on_post_delete();
```

### 3. Install Required Dependencies
Make sure you have the uuid package installed:

```bash
npm install uuid
npm install --save-dev @types/uuid
```

## How It Works

### Image Upload Process
1. User selects an image file using the "Choose Image" button
2. Image preview is shown immediately
3. When the form is submitted:
   - If editing an existing post with an image, the old image is deleted first
   - New image is uploaded to Supabase storage with a UUID filename
   - Public URL is generated and stored in the database

### Image Deletion Process
1. **Manual Deletion**: When editing a post and uploading a new image, the old image is automatically deleted
2. **Automatic Deletion**: When a blog post is deleted, the database trigger automatically removes the associated image from storage

### File Naming Convention
- Files are renamed using UUID v4 to prevent naming conflicts
- Original file extension is preserved
- Example: `550e8400-e29b-41d4-a716-446655440000.jpg`

## Component Changes

### BlogPostForm.tsx
- Added image upload state management
- Added file selection and preview functionality
- Integrated upload process into form submission
- Added automatic image deletion when replacing images

### New Functions Added
- `handleImageSelect()`: Handles file selection and preview
- `uploadImage()`: Uploads file to Supabase storage
- `deleteImageFromStorage()`: Removes images from storage

## Usage

### Creating a New Blog Post
1. Fill in the blog post details
2. Click "Choose Image" to select an image file
3. Preview will show the selected image
4. Submit the form - image will be uploaded automatically

### Editing an Existing Blog Post
1. Current image (if any) will be displayed
2. To change the image, click "Choose Image" and select a new file
3. The old image will be automatically deleted when you save

### Manual URL Entry
- You can still enter image URLs manually in the text input
- This serves as a fallback option for external images

## Error Handling
- Upload errors are caught and displayed to the user
- Failed uploads don't prevent form submission
- Storage deletion errors are logged but don't block operations

## Security
- Only authenticated users can upload/delete images
- Public read access for displaying images
- RLS policies protect against unauthorized access

## Troubleshooting

### Blog Post Deletion Errors

If you encounter errors when deleting blog posts (like "Error deleting blog post: {}"), try these solutions:

#### 1. Check Database Trigger
The database trigger might be causing issues. To disable it temporarily:

```sql
-- Disable the trigger
DROP TRIGGER IF EXISTS trigger_delete_blog_image ON blog_posts;
```

#### 2. Check Storage Permissions
Ensure your RLS policies are correctly set up:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Recreate policies if needed
DROP POLICY IF EXISTS "Admin can delete blog images" ON storage.objects;
CREATE POLICY "Admin can delete blog images" ON storage.objects FOR DELETE
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
```

#### 3. Manual Image Cleanup
If automatic deletion isn't working, you can clean up orphaned images manually:

```sql
-- Find orphaned images (images not referenced by any blog post)
SELECT name FROM storage.objects
WHERE bucket_id = 'blog-images'
AND name NOT IN (
    SELECT SUBSTRING(image_url FROM '.*/storage/v1/object/public/blog-images/(.*)')
    FROM blog_posts
    WHERE image_url LIKE '%/storage/v1/object/public/blog-images/%'
);
```

#### 4. Client-Side Only Deletion
If database triggers continue to cause issues, the client-side deletion in `BlogPostForm.tsx` will handle image cleanup. The improved error handling ensures that:
- Image deletion failures don't prevent blog post deletion
- Errors are logged but don't block the operation
- Users get appropriate feedback

### Common Issues

1. **Empty Error Objects**: Usually indicates a database trigger issue
2. **Permission Denied**: Check RLS policies and user authentication
3. **File Not Found**: Image may have already been deleted or URL is incorrect

### Testing the Setup

1. Create a blog post with an image
2. Verify the image appears in Supabase storage
3. Delete the blog post
4. Check that the image is removed from storage
5. If step 4 fails, check the troubleshooting steps above
