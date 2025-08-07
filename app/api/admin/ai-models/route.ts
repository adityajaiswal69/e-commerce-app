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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const authCheck = await checkAdminAccess(supabase);
    
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    // Fetch all AI models with provider information
    const { data: models, error } = await supabase
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
      .order('display_name');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AI models' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      models: models || []
    });

  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const authCheck = await checkAdminAccess(supabase);
    
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

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

    if (!provider_id || !model_id || !display_name) {
      return NextResponse.json(
        { error: 'Provider ID, model ID, and display name are required' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await supabase
        .from('ai_models')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy ID since this is a new record
    }

    // Create new model
    const { data: model, error } = await supabase
      .from('ai_models')
      .insert({
        provider_id,
        model_id,
        display_name,
        description,
        tags: tags || [],
        thumbnail_url,
        is_enabled: is_enabled !== undefined ? is_enabled : true,
        is_default: is_default || false,
        model_settings: model_settings || {}
      })
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
        { error: 'Failed to create AI model' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      model
    });

  } catch (error) {
    console.error('Error creating AI model:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
