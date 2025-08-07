import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Fetch available AI models with provider information
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
      .eq('is_enabled', true)
      .eq('ai_providers.is_active', true)
      .order('is_default', { ascending: false })
      .order('display_name');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AI models' },
        { status: 500 }
      );
    }

    // Filter out models whose providers are inactive
    const activeModels = models?.filter(model => model.ai_providers?.is_active) || [];

    return NextResponse.json({
      success: true,
      models: activeModels,
      total: activeModels.length
    });

  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
