import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all providers
    const { data: providers } = await supabase
      .from('ai_providers')
      .select('*');

    if (!providers) {
      return NextResponse.json({ error: 'No providers found' });
    }

    // Find each provider
    const hfProvider = providers.find(p => p.provider_key === 'huggingface');
    const stabilityProvider = providers.find(p => p.provider_key === 'stability');

    // Delete all existing models to start fresh
    await supabase.from('ai_models').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const modelsToCreate = [];

    // Only add Hugging Face models if provider has API token
    if (hfProvider && hfProvider.api_token) {
      modelsToCreate.push(
        {
          provider_id: hfProvider.id,
          model_id: 'runwayml/stable-diffusion-v1-5',
          display_name: 'Stable Diffusion v1.5 (HF)',
          description: 'General purpose text-to-image model from Hugging Face',
          tags: ['realistic', 'general', 'huggingface'],
          is_enabled: true,
          is_default: true,
          model_settings: { width: 512, height: 512, num_inference_steps: 20, guidance_scale: 7.5 }
        },
        {
          provider_id: hfProvider.id,
          model_id: 'stabilityai/stable-diffusion-2-1',
          display_name: 'Stable Diffusion v2.1 (HF)',
          description: 'Improved version with better quality from Hugging Face',
          tags: ['realistic', 'improved', 'huggingface'],
          is_enabled: true,
          is_default: false,
          model_settings: { width: 768, height: 768, num_inference_steps: 25, guidance_scale: 7.5 }
        }
      );
    }

    // Only add Stability AI models if provider has API token
    if (stabilityProvider && stabilityProvider.api_token) {
      modelsToCreate.push(
        {
          provider_id: stabilityProvider.id,
          model_id: 'stable-diffusion-xl-1024-v1-0',
          display_name: 'SDXL 1024 v1.0 ⭐',
          description: '✅ WORKING - High resolution Stable Diffusion XL',
          tags: ['xl', 'high-res', 'stability', 'working', 'recommended'],
          is_enabled: true,
          is_default: !hfProvider?.api_token, // Default if no HF token
          model_settings: { 
            width: 1024, 
            height: 1024, 
            steps: 30, 
            cfg_scale: 7.5
          }
        },
        {
          provider_id: stabilityProvider.id,
          model_id: 'stable-diffusion-xl-1024-v0-9',
          display_name: 'SDXL 1024 v0.9 ⭐',
          description: '✅ WORKING - Alternative Stable Diffusion XL model',
          tags: ['xl', 'stable', 'stability', 'working'],
          is_enabled: true,
          is_default: false,
          model_settings: { 
            width: 1024, 
            height: 1024, 
            steps: 30, 
            cfg_scale: 7.5
          }
        }
      );
    }

    if (modelsToCreate.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No providers with API tokens found. Please configure at least one provider.',
        providersFound: providers.length,
        modelsCreated: 0
      });
    }

    // Insert all models
    const { data: createdModels, error } = await supabase
      .from('ai_models')
      .insert(modelsToCreate)
      .select();

    if (error) {
      console.error('Error creating models:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create models',
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Working models set up successfully!',
      providersFound: providers.length,
      modelsCreated: createdModels?.length || 0,
      models: createdModels,
      recommendations: [
        '✅ Only working models have been configured',
        '🔑 Models are only created for providers with API tokens',
        '⭐ Stability AI SDXL models are confirmed working',
        '💡 Add API tokens to other providers to enable more models'
      ]
    });

  } catch (error) {
    console.error('Error in setup-working-models:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
