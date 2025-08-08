# Background Remover V3 - Reusable Images Setup Guide

## Overview
This is a new approach where background-removed images are stored in a dedicated bucket and can be reused by all users. Users can browse and select from a library of background-removed images to add to their canvas.

## New Features

### ✅ **Reusable Image Library**
- **Shared Storage**: All background-removed images stored in `background-removed-images` bucket
- **Public Access**: Users can browse and use images created by others
- **Categorization**: Images organized by categories (animals, objects, people, etc.)
- **Search & Filter**: Find images by name, tags, or category
- **Usage Tracking**: Track how many times each image has been used

### ✅ **Enhanced Database Schema**
- **Extended Logging**: Tracks image metadata, usage counts, and user attribution
- **Public/Private**: Users can choose to make their images public or private
- **Tagging System**: Add tags for better organization and search
- **Category System**: Organize images by type (animals, objects, people, etc.)

### ✅ **User-Friendly Interface**
- **Image Browser**: Modal interface to browse and select images
- **Search & Filter**: Find images by category or search terms
- **One-Click Add**: Add images directly to canvas with one click
- **Usage Statistics**: See how popular each image is

## Setup Instructions

### 1. Database Schema Setup
Run the updated SQL in your Supabase SQL Editor:

```sql
-- Create removed_background_logs table with new fields
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_user_id ON removed_background_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_removed_at ON removed_background_logs(removed_at);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_is_public ON removed_background_logs(is_public);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_category ON removed_background_logs(category);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_tags ON removed_background_logs USING GIN(tags);

-- Enable RLS
ALTER TABLE removed_background_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own background removal logs" ON removed_background_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own background removal logs" ON removed_background_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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

### 2. Storage Bucket Setup
Create the new storage bucket in Supabase:

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

### 3. Environment Variables
Add to your `.env.local`:

```env
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
```

## How It Works

### 1. Background Removal Process
1. **User Uploads Image**: User uploads an image to the design canvas
2. **Remove Background**: User clicks "Remove Background" button
3. **API Processing**: Image sent to remove.bg API for processing
4. **Storage**: Processed image stored in `background-removed-images` bucket
5. **Database Log**: Entry created in `removed_background_logs` table
6. **Canvas Update**: Original image replaced with background-removed version

### 2. Image Library Browsing
1. **Browse Images**: User clicks "Browse Background Removed Images"
2. **Modal Opens**: Image picker modal shows available images
3. **Search & Filter**: User can search by name or filter by category
4. **Select Image**: User clicks on an image to add it to canvas
5. **Usage Tracking**: Usage count incremented when image is used

### 3. API Endpoints

#### `/api/background-remover` (POST)
- **Purpose**: Remove background from image and store for reuse
- **Parameters**: 
  - `imageUrl`: URL of image to process
  - `makePublic`: Whether to make image available to others
  - `imageName`: Human-readable name for the image
  - `tags`: Array of tags for categorization
  - `category`: Category of the image
- **Returns**: New image URL and log ID

#### `/api/background-removed-images` (GET)
- **Purpose**: Fetch available background-removed images
- **Parameters**:
  - `category`: Filter by category
  - `search`: Search by name or tags
  - `limit`: Number of images to return
  - `offset`: Pagination offset
- **Returns**: Array of images with metadata

#### `/api/background-removed-images` (POST)
- **Purpose**: Increment usage count when image is used
- **Parameters**: `imageId`: ID of the image being used
- **Returns**: Success confirmation

## User Interface

### Image Controls Panel
The design tool now has two background-related buttons:

1. **"Remove Background"** (Green button)
   - Processes the selected image
   - Stores result in shared bucket
   - Makes image available to others
   - Updates canvas with processed image

2. **"Browse Background Removed Images"** (Blue button)
   - Opens image picker modal
   - Shows grid of available images
   - Search and filter functionality
   - One-click add to canvas

### Image Picker Modal
- **Grid Layout**: Shows images in responsive grid
- **Search Bar**: Search by image name or tags
- **Category Filter**: Filter by image category
- **Image Cards**: Show image preview, name, creator, usage count
- **Load More**: Pagination for large libraries

## Database Schema Details

### `removed_background_logs` Table
```sql
- id: UUID (Primary Key)
- bucket: TEXT (Storage bucket name)
- path: TEXT (File path in bucket)
- old_url: TEXT (Original image URL)
- new_url: TEXT (Processed image URL)
- removed_at: TIMESTAMP (When background was removed)
- user_id: UUID (User who created the image)
- is_public: BOOLEAN (Whether others can use this image)
- image_name: TEXT (Human-readable name)
- tags: TEXT[] (Array of tags)
- category: TEXT (Image category)
- file_size: INTEGER (File size in bytes)
- dimensions: TEXT (Width x Height)
- usage_count: INTEGER (How many times used)
```

## Usage Examples

### Remove Background from Image
```javascript
const result = await removeBackground(
  imageUrl,
  true, // makePublic
  "My Background Removed Image",
  ["design", "logo", "business"],
  "objects"
);

if (result.success) {
  // Update canvas with new image
  updateElement('UPDATE_ELEMENT', {
    id: selectedElement.id,
    data: { ...imageData, src: result.processedImageUrl }
  });
}
```

### Browse and Select Images
```javascript
const result = await fetchBackgroundRemovedImages(
  'animals', // category
  'cat', // search
  20, // limit
  0 // offset
);

if (result.success) {
  // Show images in picker modal
  setImages(result.images);
}
```

### Add Image to Canvas
```javascript
// Add image to canvas
addImage(centerX, centerY, image.new_url, width, height);

// Increment usage count
await incrementImageUsage(image.id);
```

## Benefits of This Approach

### ✅ **Community-Driven**
- Users contribute to shared image library
- Popular images become more discoverable
- Reduces duplicate processing of same images

### ✅ **Cost Effective**
- Reuse existing background-removed images
- Reduce API calls to remove.bg
- Shared storage reduces individual storage costs

### ✅ **User Experience**
- Instant access to pre-processed images
- No waiting for background removal
- Rich metadata (tags, categories, usage stats)

### ✅ **Analytics & Insights**
- Track most popular images
- Monitor usage patterns
- Identify trending categories

## Monitoring & Analytics

### Database Queries
```sql
-- Most popular images
SELECT image_name, usage_count, category 
FROM removed_background_logs 
WHERE is_public = true 
ORDER BY usage_count DESC 
LIMIT 10;

-- Category usage statistics
SELECT category, COUNT(*) as total_images, 
       AVG(usage_count) as avg_usage
FROM removed_background_logs 
WHERE is_public = true 
GROUP BY category;

-- Recent activity
SELECT image_name, user_id, removed_at, usage_count
FROM removed_background_logs 
WHERE is_public = true 
ORDER BY removed_at DESC 
LIMIT 20;
```

### Admin Dashboard Features
- **Popular Images**: Show most-used background-removed images
- **Category Analytics**: Usage statistics by category
- **User Contributions**: Track who creates the most images
- **Storage Usage**: Monitor bucket storage usage

## Future Enhancements

### Planned Features
- **Image Collections**: Group related images together
- **Favorites System**: Users can favorite images
- **Advanced Search**: Search by image characteristics
- **Batch Operations**: Process multiple images at once
- **Quality Ratings**: Users can rate image quality
- **Auto-Tagging**: AI-powered automatic tagging

### Analytics Dashboard
- **Usage Charts**: Visual usage statistics
- **Trend Analysis**: Identify trending image types
- **Cost Tracking**: Monitor API usage and costs
- **User Insights**: Popular creators and categories

## Troubleshooting

### Common Issues

1. **"Bucket not found"**
   - Verify `background-removed-images` bucket exists
   - Check bucket permissions

2. **"No images found"**
   - Check if any images are marked as public
   - Verify RLS policies are correct

3. **"Upload failed"**
   - Check storage bucket permissions
   - Verify file size limits

4. **"Search not working"**
   - Check if GIN index is created for tags
   - Verify search query format

### Debug Steps
1. Check browser console for errors
2. Verify database schema is applied
3. Test with simple image first
4. Check storage bucket permissions
5. Review API response logs

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API response logs
3. Verify database schema setup
4. Test with different image types
5. Check storage bucket configuration 