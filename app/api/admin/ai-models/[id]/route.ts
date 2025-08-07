import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Helper function to check admin access
async function checkAdminAccess(supabase: any) {
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) {
    return { error: 'Authentication required', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }

  return { session };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const authCheck = await checkAdminAccess(supabase);

    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id } = await params;

    // Fetch specific model with provider information
    const { data: model, error } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (
          id,
          name,
          provider_key,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error || !model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      model
    });

  } catch (error) {
    console.error('Error fetching AI model:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const authCheck = await checkAdminAccess(supabase);

    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      provider_id,
      model_id,
      display_name,
      description,
      tags,
      thumbnail_url,
      is_enabled,
      is_default,
      model_settings
    } = body;

    // If this is set as default, unset other defaults
    if (is_default) {
      await supabase
        .from('ai_models')
        .update({ is_default: false })
        .neq('id', id);
    }

    // Prepare update data
    const updateData: any = {};
    if (provider_id !== undefined) updateData.provider_id = provider_id;
    if (model_id !== undefined) updateData.model_id = model_id;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (is_enabled !== undefined) updateData.is_enabled = is_enabled;
    if (is_default !== undefined) updateData.is_default = is_default;
    if (model_settings !== undefined) updateData.model_settings = model_settings;

    // First check if the model exists
    const { data: existingModel } = await supabase
      .from('ai_models')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingModel) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Update model
    const { data: model, error } = await supabase
      .from('ai_models')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        ai_providers (
          id,
          name,
          provider_key,
          is_active
        )
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: `Failed to update AI model: ${error.message}` },
        { status: 500 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found after update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      model
    });

  } catch (error) {
    console.error('Error updating AI model:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const authCheck = await checkAdminAccess(supabase);

    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id } = await params;

    // Delete model
    const { error } = await supabase
      .from('ai_models')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete AI model' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting AI model:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
