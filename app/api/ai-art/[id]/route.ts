import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // First, get the AI art record to check ownership and get file paths
    const { data: aiArt, error: fetchError } = await supabase
      .from('ai_art')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !aiArt) {
      return NextResponse.json(
        { error: 'AI art not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the database record
    const { error: deleteError } = await supabase
      .from('ai_art')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete AI art' },
        { status: 500 }
      );
    }

    // Optionally delete the files from storage
    // Note: Files will be automatically cleaned up by storage policies
    
    return NextResponse.json({
      success: true,
      message: 'AI art deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting AI art:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch specific AI art record
    const { data: aiArt, error } = await supabase
      .from('ai_art')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error || !aiArt) {
      return NextResponse.json(
        { error: 'AI art not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: aiArt
    });

  } catch (error) {
    console.error('Error fetching AI art:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
