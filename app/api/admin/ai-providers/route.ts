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

    // Fetch all AI providers
    const { data: providers, error } = await supabase
      .from('ai_providers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AI providers' },
        { status: 500 }
      );
    }

    // Don't expose API tokens in the response
    const sanitizedProviders = providers?.map(provider => ({
      ...provider,
      api_token: provider.api_token ? '***HIDDEN***' : null
    }));

    return NextResponse.json({
      success: true,
      providers: sanitizedProviders || []
    });

  } catch (error) {
    console.error('Error fetching AI providers:', error);
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
    const { name, provider_key, base_url, api_token, settings, is_active } = body;

    if (!name || !provider_key) {
      return NextResponse.json(
        { error: 'Name and provider key are required' },
        { status: 400 }
      );
    }

    // Create new provider
    const { data: provider, error } = await supabase
      .from('ai_providers')
      .insert({
        name,
        provider_key,
        base_url,
        api_token,
        settings: settings || {},
        is_active: is_active || false
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Provider key already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create AI provider' },
        { status: 500 }
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
    console.error('Error creating AI provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
