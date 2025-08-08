# Background Remover Feature Setup

## Overview
The design tool now includes a background remover feature that uses the remove.bg API to automatically remove backgrounds from images in the design canvas.

## Features
- ✅ Remove background from any image element
- ✅ Automatic upload of processed images to Supabase storage
- ✅ Real-time replacement of original image with processed version
- ✅ Loading states and error handling
- ✅ Integration with existing design tool workflow

## Setup Instructions

### 1. Get Remove.bg API Key
1. Visit [remove.bg](https://www.remove.bg/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Note: Free tier includes 50 free API calls per month

### 2. Add Environment Variable
Add the following to your `.env.local` file:

```env
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
```

### 3. API Endpoint
The feature uses a new API endpoint at `/api/background-remover` that:
- Accepts image URLs
- Calls the remove.bg API
- Returns processed images as base64 data URLs
- Handles errors gracefully

### 4. Usage in Design Tool
1. Upload an image to the design canvas
2. Select the image element
3. In the Image Properties panel, click "Remove Background"
4. Wait for processing (usually 5-10 seconds)
5. The image will be automatically replaced with the background-removed version

## Technical Implementation

### Files Added/Modified:
- `app/api/background-remover/route.ts` - API endpoint for background removal
- `lib/backgroundRemover.ts` - Utility functions for background removal
- `components/design/ImageControls.tsx` - Added background remover button

### Key Features:
- **Error Handling**: Comprehensive error handling for API failures
- **Loading States**: Visual feedback during processing
- **Storage Integration**: Automatic upload to Supabase storage
- **Image Replacement**: Seamless replacement of original images
- **User Feedback**: Clear success/error messages

### API Flow:
1. User clicks "Remove Background"
2. Frontend calls `/api/background-remover` with image URL
3. Backend downloads image and sends to remove.bg API
4. Processed image returned as base64
5. Frontend converts to blob and uploads to Supabase
6. Image element updated with new URL

## Error Handling
The feature handles various error scenarios:
- Missing API key
- Invalid image URLs
- Network failures
- Remove.bg API errors
- Upload failures

## Cost Considerations
- Remove.bg free tier: 50 API calls/month
- Additional calls: $0.20 per image
- Consider implementing usage limits for production

## Future Enhancements
- Batch processing for multiple images
- Background replacement (not just removal)
- Local processing option for privacy
- Usage tracking and limits
- Preview before applying changes 