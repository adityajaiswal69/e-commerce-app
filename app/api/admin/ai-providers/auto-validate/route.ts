import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { provider_id } = await request.json();
    const supabase = await createServerSupabaseClient();
    
    // Get all models for this provider
    const { data: models, error } = await supabase
      .from('ai_models')
      .select('id, display_name, model_id')
      .eq('provider_id', provider_id)
      .eq('is_enabled', true);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch models', details: error });
    }

    if (!models || models.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No models found for this provider',
        validated_models: 0
      });
    }

    // Trigger validation for all models of this provider
    const validateResponse = await fetch(`${request.nextUrl.origin}/api/admin/ai-models/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_ids: models.map(m => m.id) })
    });

    const validateResult = await validateResponse.json();

    return NextResponse.json({
      success: true,
      message: `Validated ${models.length} models for provider`,
      validation_results: validateResult,
      models_tested: models.map(m => ({
        id: m.id,
        display_name: m.display_name,
        model_id: m.model_id
      }))
    });

  } catch (error) {
    console.error('Error in auto-validate:', error);
    return NextResponse.json({
      success: false,
      error: 'Auto-validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
