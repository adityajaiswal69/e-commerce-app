import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, bucket, path, makePublic = false, imageName = '', tags = [] } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    // Get the remove.bg API key from environment variables
    const apiKey = process.env.REMOVE_BG_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Remove.bg API key not configured. Please add REMOVE_BG_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Call remove.bg API
    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        size: 'auto'
      }),
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error('Remove.bg API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to remove background' },
        { status: removeBgResponse.status }
      );
    }

    // Get the processed image as buffer
    const processedImageBuffer = await removeBgResponse.arrayBuffer();
    
    // Create server-side Supabase client with service role
    const supabase = await createServerSupabaseClient();
    
    // Get current user for logging
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Generate unique filename for the processed image
    const timestamp = Date.now();
    const randomId = uuidv4().slice(0, 8);
    const processedFileName = `processed/${timestamp}-${randomId}.png`;
    
    // Upload the processed image to the background-removed-images bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('background-removed-images')
      .upload(processedFileName, processedImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload processed image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the public URL for the processed image
    const { data: urlData } = supabase.storage
      .from('background-removed-images')
      .getPublicUrl(processedFileName);

    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`; // Cache busting

    // Get image dimensions and file size
    const imageBlob = new Blob([processedImageBuffer], { type: 'image/png' });
    const fileSize = imageBlob.size;
    
    // We'll set a default dimension since we can't easily get it server-side
    const dimensions = 'auto'; // Will be updated when image is loaded

    // Log the background removal action with new fields
    const { data: logData, error: logError } = await supabase
      .from('removed_background_logs')
      .insert({
        bucket: 'background-removed-images',
        path: processedFileName,
        old_url: imageUrl,
        new_url: newUrl,
        user_id: user.id,
        is_public: makePublic,
        image_name: imageName || `Background Removed Image ${timestamp}`,
        tags: tags,
        category: 'general', // Default category
        file_size: fileSize,
        dimensions: dimensions,
        usage_count: 0
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log background removal:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      processedImageUrl: newUrl,
      logId: logData?.id,
      message: makePublic ? 'Background removed and image made public for reuse' : 'Background removed successfully'
    });

  } catch (error) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 