import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Test if ai_providers table exists
    const { data: providers, error: providersError } = await supabase
      .from('ai_providers')
      .select('*');

    if (providersError) {
      return NextResponse.json({
        success: false,
        error: 'ai_providers table error',
        details: providersError
      });
    }

    // Test if ai_models table exists
    const { data: models, error: modelsError } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (*)
      `);

    if (modelsError) {
      return NextResponse.json({
        success: false,
        error: 'ai_models table error',
        details: modelsError
      });
    }

    return NextResponse.json({
      success: true,
      message: 'AI tables exist and are accessible',
      providersCount: providers?.length || 0,
      modelsCount: models?.length || 0,
      providers: providers,
      models: models
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error
    });
  }
}
