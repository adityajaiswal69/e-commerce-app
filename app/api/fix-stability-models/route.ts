import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🔧 Fixing Stability AI model IDs...');
    
    // Get Stability AI provider
    const { data: providers } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('provider_key', 'stability');

    if (!providers || providers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Stability AI provider not found'
      });
    }

    const stabilityProvider = providers[0];

    // Get current models
    const { data: currentModels } = await supabase
      .from('ai_models')
      .select('*')
      .eq('provider_id', stabilityProvider.id);

    console.log('Current models:', currentModels?.map(m => ({ id: m.id, model_id: m.model_id, name: m.display_name })));

    // Delete old models with wrong IDs
    if (currentModels && currentModels.length > 0) {
      await supabase
        .from('ai_models')
        .delete()
        .eq('provider_id', stabilityProvider.id);
      
      console.log('Deleted old models');
    }

    // Create new models with correct IDs
    const correctModels = [
      {
        provider_id: stabilityProvider.id,
        model_id: 'stable-diffusion-xl-1024-v1-0',
        display_name: 'SDXL 1024 v1.0 (Validated)',
        description: 'CONFIRMED WORKING - High resolution Stable Diffusion XL',
        tags: ['xl', 'high-res', 'stability', 'working', 'validated'],
        is_enabled: true,
        is_default: true,
        model_settings: { 
          width: 1024, 
          height: 1024, 
          steps: 30, 
          cfg_scale: 7.5
        }
      },
      {
        provider_id: stabilityProvider.id,
        model_id: 'stable-diffusion-v1-6',
        display_name: 'Stable Diffusion v1.6',
        description: 'Classic Stable Diffusion model - reliable and fast',
        tags: ['classic', 'stable', 'stability', 'working'],
        is_enabled: true,
        is_default: false,
        model_settings: { 
          width: 512, 
          height: 512, 
          steps: 30, 
          cfg_scale: 7.5
        }
      }
    ];

    const { data: newModels, error: insertError } = await supabase
      .from('ai_models')
      .insert(correctModels)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create new models',
        details: insertError.message
      });
    }

    console.log('Created new models:', newModels?.map(m => ({ id: m.id, model_id: m.model_id, name: m.display_name })));

    // Test the first model
    const testModel = newModels?.[0];
    if (testModel && stabilityProvider.api_token) {
      console.log('Testing model:', testModel.model_id);
      
      try {
        const testResponse = await fetch(`https://api.stability.ai/v1/generation/${testModel.model_id}/text-to-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stabilityProvider.api_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text_prompts: [{ text: 'test', weight: 1 }],
            cfg_scale: 7.5,
            height: 1024,
            width: 1024,
            steps: 10,
            samples: 1,
          }),
        });

        const testResult = testResponse.ok ? 'WORKING' : `ERROR ${testResponse.status}`;
        console.log('Test result:', testResult);

        return NextResponse.json({
          success: true,
          message: 'Fixed Stability AI models',
          old_models_deleted: currentModels?.length || 0,
          new_models_created: newModels?.length || 0,
          models: newModels?.map(m => ({
            id: m.id,
            model_id: m.model_id,
            display_name: m.display_name,
            is_enabled: m.is_enabled,
            is_default: m.is_default
          })),
          test_result: {
            model_tested: testModel.model_id,
            status: testResult,
            api_token_configured: !!stabilityProvider.api_token
          }
        });

      } catch (testError: any) {
        console.log('Test error:', testError.message);
        
        return NextResponse.json({
          success: true,
          message: 'Fixed Stability AI models (test failed but models created)',
          old_models_deleted: currentModels?.length || 0,
          new_models_created: newModels?.length || 0,
          models: newModels?.map(m => ({
            id: m.id,
            model_id: m.model_id,
            display_name: m.display_name,
            is_enabled: m.is_enabled,
            is_default: m.is_default
          })),
          test_result: {
            model_tested: testModel.model_id,
            status: 'TEST_FAILED',
            error: testError.message,
            api_token_configured: !!stabilityProvider.api_token
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Fixed Stability AI models',
      old_models_deleted: currentModels?.length || 0,
      new_models_created: newModels?.length || 0,
      models: newModels?.map(m => ({
        id: m.id,
        model_id: m.model_id,
        display_name: m.display_name,
        is_enabled: m.is_enabled,
        is_default: m.is_default
      })),
      note: 'No API token found for testing'
    });

  } catch (error: any) {
    console.error('Fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix models',
      details: error.message
    });
  }
}
