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

    // Fetch specific provider
    const { data: provider, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Don't expose API token in the response
    const sanitizedProvider = {
      ...provider,
      api_token: provider.api_token ? '***HIDDEN***' : null
    };

    return NextResponse.json({
      success: true,
      provider: sanitizedProvider
    });

  } catch (error) {
    console.error('Error fetching AI provider:', error);
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
    const { name, base_url, api_token, settings, is_active } = body;

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (base_url !== undefined) updateData.base_url = base_url;
    if (settings !== undefined) updateData.settings = settings;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    // Only update API token if it's provided and not the placeholder
    if (api_token && api_token !== '***HIDDEN***') {
      updateData.api_token = api_token;
    }

    // Update provider
    const { data: provider, error } = await supabase
      .from('ai_providers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update AI provider' },
        { status: 500 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Don't expose API token in response
    const sanitizedProvider = {
      ...provider,
      api_token: provider.api_token ? '***HIDDEN***' : null
    };

    return NextResponse.json({
      success: true,
      provider: sanitizedProvider
    });

  } catch (error) {
    console.error('Error updating AI provider:', error);
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

    // Check if provider has associated models
    const { data: models, error: modelsError } = await supabase
      .from('ai_models')
      .select('id')
      .eq('provider_id', id)
      .limit(1);

    if (modelsError) {
      console.error('Error checking models:', modelsError);
      return NextResponse.json(
        { error: 'Failed to check provider dependencies' },
        { status: 500 }
      );
    }

    if (models && models.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete provider with associated models. Delete models first.' },
        { status: 409 }
      );
    }

    // Delete provider
    const { error } = await supabase
      .from('ai_providers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete AI provider' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting AI provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
