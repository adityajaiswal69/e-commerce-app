import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
// Using anon client only + SQL function with SECURITY DEFINER to fetch credentials safely
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

    // Determine active provider and key via SQL function (SECURITY DEFINER)
    const supabase = await createServerSupabaseClient();
    const { data: creds, error: credsError } = await supabase
      .rpc('get_active_background_removal_credentials');
    if (credsError) {
      return NextResponse.json({ error: 'Failed to load background removal settings' }, { status: 500 });
    }
    const provider = Array.isArray(creds) && creds.length > 0 ? creds[0] as any : null;
    if (!provider) {
      return NextResponse.json(
        { error: 'Background remover is not configured. Please enable a provider and set API key in admin.' },
        { status: 500 }
      );
    }
    const providerKey = provider.provider as 'removebg' | 'stability';

    let processedImageBuffer: ArrayBuffer;
    if (providerKey === 'removebg') {
      const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': provider.api_key as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: imageUrl, size: 'auto' }),
      });
      if (!removeBgResponse.ok) {
        const errorText = await removeBgResponse.text();
        console.error('Remove.bg API error:', errorText);
        return NextResponse.json({ error: 'Failed to remove background' }, { status: removeBgResponse.status });
      }
      processedImageBuffer = await removeBgResponse.arrayBuffer();
    } else {
      // Stability AI background removal (multipart with image bytes)
      const imageFetch = await fetch(imageUrl);
      if (!imageFetch.ok) {
        return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 400 });
      }
      const srcContentType = imageFetch.headers.get('content-type') || '';
      if (!srcContentType.startsWith('image/')) {
        return NextResponse.json({ error: 'Source URL is not an image' }, { status: 400 });
      }
      const inputBuffer = await imageFetch.arrayBuffer();
      const ext = srcContentType.includes('png') ? 'png' : srcContentType.includes('jpeg') || srcContentType.includes('jpg') ? 'jpg' : 'png';
      const form = new FormData();
      form.append('image', new Blob([inputBuffer], { type: srcContentType || 'image/png' }), `input.${ext}`);
      // Output as PNG per Stability docs
      form.append('output_format', 'png');

      const stabilityResponse = await fetch('https://api.stability.ai/v2beta/stable-image/edit/remove-background', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${provider.api_key as string}`,
          Accept: 'image/*',
        },
        body: form,
      });
      if (!stabilityResponse.ok) {
        const contentType = stabilityResponse.headers.get('content-type') || '';
        const errorText = contentType.includes('application/json') ? JSON.stringify(await stabilityResponse.json()) : await stabilityResponse.text();
        console.error('Stability AI API error:', errorText);
        return NextResponse.json({ error: `Stability AI error: ${errorText}` }, { status: stabilityResponse.status });
      }
      processedImageBuffer = await stabilityResponse.arrayBuffer();
    }
    
    // Reuse server Supabase client for upload and logging
    
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