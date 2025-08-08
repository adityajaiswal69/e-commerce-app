# Background Remover V2 - Complete Setup Guide

## Overview
This is an enhanced background remover system that integrates with your Supabase storage buckets and provides comprehensive logging. The system automatically replaces the original image with the background-removed version while maintaining the same public URL.

## Features

### ✅ **Enhanced API Integration**
- **Direct File Replacement**: Processes image and uploads back to the same bucket/path
- **Same Public URL**: Maintains the original URL with cache-busting query parameter
- **Multi-Bucket Support**: Works with all your storage buckets (designs, blog-images, product-images, etc.)
- **Service Role Authentication**: Uses Supabase service role for secure file operations

### ✅ **Comprehensive Logging**
- **Action Tracking**: Logs all background removal actions
- **User Attribution**: Links actions to specific users
- **Analytics Ready**: Structured data for usage analytics
- **Admin Access**: Admins can view all logs

### ✅ **Frontend Integration**
- **Automatic URL Updates**: Canvas images update instantly
- **Cache Busting**: Prevents browser caching issues
- **Error Handling**: Comprehensive error messages
- **Loading States**: Visual feedback during processing

## Setup Instructions

### 1. Database Schema Setup
Run the following SQL in your Supabase SQL Editor:

```sql
-- Create removed_background_logs table
CREATE TABLE IF NOT EXISTS removed_background_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  old_url TEXT NOT NULL,
  new_url TEXT NOT NULL,
  removed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_user_id ON removed_background_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_removed_background_logs_removed_at ON removed_background_logs(removed_at);

-- Enable RLS
ALTER TABLE removed_background_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own background removal logs" ON removed_background_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own background removal logs" ON removed_background_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all background removal logs" ON removed_background_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

### 2. Environment Variables
Add to your `.env.local`:

```env
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
```

### 3. API Endpoint
The enhanced API endpoint (`/api/background-remover`) now:
- Accepts `imageUrl`, `bucket`, and `path` parameters
- Downloads image from URL
- Sends to remove.bg API
- Uploads processed image back to same bucket/path
- Returns new URL with cache-busting
- Logs the action to database

### 4. Frontend Integration
The design tool now:
- Extracts bucket and path from image URLs
- Calls the enhanced API
- Updates canvas images instantly
- Provides comprehensive error handling

## Technical Implementation

### API Flow
1. **Frontend**: Extracts bucket/path from image URL
2. **API Call**: Sends imageUrl, bucket, path to `/api/background-remover`
3. **Remove.bg**: Processes image and returns binary data
4. **Supabase Upload**: Uploads processed image to same bucket/path
5. **URL Return**: Returns new URL with cache-busting parameter
6. **Frontend Update**: Updates canvas image instantly
7. **Logging**: Records action in database

### File Structure
```
app/api/background-remover/route.ts     # Enhanced API endpoint
lib/backgroundRemover.ts                # Updated utility functions
components/design/ImageControls.tsx     # Updated frontend integration
sql/schema/removed_background_logs.sql  # Database schema
```

### Key Functions

#### `extractBucketAndPath(supabaseUrl)`
Extracts bucket and path from Supabase storage URLs:
```javascript
// Input: "https://project.supabase.co/storage/v1/object/public/designs/user123/image.png"
// Output: { bucket: "designs", path: "user123/image.png" }
```

#### `getBucketFromUrl(url)`
Fallback function to determine bucket from URL patterns:
```javascript
// Supports: designs, blog-images, product-images, ai-art-images, art-assets
```

#### `removeBackground(imageUrl, bucket, path)`
Enhanced function that calls the new API:
```javascript
const result = await removeBackground(imageUrl, 'designs', 'user123/image.png');
// Returns: { success: true, processedImageUrl: "https://..." }
```

## Usage Examples

### Design Tool Integration
```javascript
// In ImageControls component
const handleRemoveBackground = async () => {
  const bucketAndPath = extractBucketAndPath(imageData.src);
  const result = await removeBackground(imageData.src, bucketAndPath.bucket, bucketAndPath.path);
  
  if (result.success) {
    updateElement('UPDATE_ELEMENT', {
      id: selectedElement.id,
      data: { ...imageData, src: result.processedImageUrl }
    });
  }
};
```

### Multi-Bucket Support
The system automatically works with all your buckets:
- `designs` → Design tool images
- `blog-images` → Blog post images  
- `product-images` → Product images
- `ai-art-images` → AI-generated art
- `art-assets` → Shapes, emojis, etc.

## Error Handling

### API Errors
- **Missing API Key**: Clear error message with setup instructions
- **Invalid URLs**: URL format validation
- **Upload Failures**: Detailed error messages
- **Authentication**: Proper auth checks

### Frontend Errors
- **Network Issues**: Graceful fallback
- **Invalid Buckets**: Fallback bucket detection
- **Missing Images**: Clear user feedback

## Monitoring & Analytics

### Database Queries
```sql
-- Recent background removals
SELECT * FROM removed_background_logs 
ORDER BY removed_at DESC LIMIT 10;

-- User activity
SELECT user_id, COUNT(*) as removals 
FROM removed_background_logs 
GROUP BY user_id;

-- Bucket usage
SELECT bucket, COUNT(*) as usage 
FROM removed_background_logs 
GROUP BY bucket;
```

### Admin Dashboard
Admins can view all background removal logs with:
- User information
- Timestamp data
- Bucket/path details
- Old/new URL tracking

## Cost Optimization

### Remove.bg API Usage
- **Free Tier**: 50 API calls/month
- **Paid Tier**: $0.20 per image
- **Monitoring**: Track usage in removed_background_logs table

### Storage Optimization
- **Same Path**: Replaces original files
- **PNG Format**: Maintains transparency
- **Cache Busting**: Prevents stale images

## Security Considerations

### Authentication
- **User Verification**: All actions require authentication
- **Service Role**: Server-side operations use service role
- **RLS Policies**: Database access controlled by policies

### File Access
- **Bucket Permissions**: Proper storage bucket policies
- **Path Validation**: Secure path handling
- **URL Validation**: Input sanitization

## Future Enhancements

### Planned Features
- **Batch Processing**: Remove backgrounds from multiple images
- **Background Replacement**: Replace with custom backgrounds
- **Usage Limits**: Per-user API call limits
- **Preview Mode**: Show preview before applying
- **Undo Function**: Revert background removal

### Analytics Dashboard
- **Usage Charts**: Visual usage statistics
- **Cost Tracking**: API call cost monitoring
- **User Insights**: Popular image types, etc.

## Troubleshooting

### Common Issues

1. **"Bucket not found"**
   - Verify bucket exists in Supabase storage
   - Check bucket permissions

2. **"Authentication required"**
   - Ensure user is logged in
   - Check auth session

3. **"Upload failed"**
   - Verify service role permissions
   - Check file path validity

4. **"Remove.bg API error"**
   - Verify API key is valid
   - Check API call limits

### Debug Steps
1. Check browser console for errors
2. Verify API key in environment variables
3. Test with simple image first
4. Check Supabase storage permissions
5. Review database logs

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API response logs
3. Verify database schema setup
4. Test with different image types 