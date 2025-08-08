import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Background-removed-images API called with:', { search, limit, offset });

    const supabase = await createServerSupabaseClient();

    // First, check if the table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('removed_background_logs')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table check error:', tableError);
      return NextResponse.json(
        { 
          error: 'Database table not found. Please run the SQL schema setup first.',
          details: tableError.message 
        },
        { status: 500 }
      );
    }

    // Build the query - simplified without categories
    let query = supabase
      .from('removed_background_logs')
      .select(`
        id,
        new_url,
        image_name,
        tags,
        category,
        file_size,
        dimensions,
        usage_count,
        removed_at,
        user_id
      `)
      .eq('is_public', true)
      .order('usage_count', { ascending: false })
      .order('removed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter
    if (search) {
      query = query.or(`image_name.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data: images, error } = await query;

    if (error) {
      console.error('Error fetching background-removed images:', error);
      return NextResponse.json(
        { error: 'Failed to fetch images', details: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('removed_background_logs')
      .select('id', { count: 'exact', head: true })
      .eq('is_public', true);

    if (search) {
      countQuery = countQuery.or(`image_name.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { count } = await countQuery;

    console.log('Successfully fetched images:', { count: images?.length || 0, total: count || 0 });

    return NextResponse.json({
      success: true,
      images: images || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    });

  } catch (error) {
    console.error('Error in background-removed-images API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Endpoint to increment usage count when an image is used
export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get current usage count and increment it
    const { data: currentData, error: fetchError } = await supabase
      .from('removed_background_logs')
      .select('usage_count')
      .eq('id', imageId)
      .single();

    if (fetchError) {
      console.error('Error fetching current usage count:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch current usage count', details: fetchError.message },
        { status: 500 }
      );
    }

    // Increment usage count
    const { error } = await supabase
      .from('removed_background_logs')
      .update({ usage_count: (currentData?.usage_count || 0) + 1 })
      .eq('id', imageId);

    if (error) {
      console.error('Error updating usage count:', error);
      return NextResponse.json(
        { error: 'Failed to update usage count', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usage count updated'
    });

  } catch (error) {
    console.error('Error updating usage count:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 