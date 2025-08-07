import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all models with their providers
    const { data: models, error: modelsError } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (*)
      `);

    if (modelsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch models',
        details: modelsError
      });
    }

    // Get all providers
    const { data: providers, error: providersError } = await supabase
      .from('ai_providers')
      .select('*');

    if (providersError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch providers',
        details: providersError
      });
    }

    return NextResponse.json({
      success: true,
      models: models || [],
      providers: providers || [],
      modelCount: models?.length || 0,
      providerCount: providers?.length || 0
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error
    });
  }
}
