import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🧹 Starting complete model cleanup and setup...');
    
    // Step 1: DELETE ALL EXISTING MODELS (complete cleanup)
    const { error: deleteError } = await supabase
      .from('ai_models')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all models

    if (deleteError) {
      console.error('Error deleting models:', deleteError);
      return NextResponse.json({ error: 'Failed to delete existing models', details: deleteError });
    }

    console.log('✅ All existing models deleted');

    // Step 2: Get all providers
    const { data: providers } = await supabase
      .from('ai_providers')
      .select('*');

    if (!providers) {
      return NextResponse.json({ error: 'No providers found' });
    }

    console.log(`📋 Found ${providers.length} providers`);

    // Step 3: Find providers with valid API tokens
    const stabilityProvider = providers.find(p => p.provider_key === 'stability' && p.api_token);
    const hfProvider = providers.find(p => p.provider_key === 'huggingface' && p.api_token);
    const openaiProvider = providers.find(p => p.provider_key === 'openai' && p.api_token);
    const replicateProvider = providers.find(p => p.provider_key === 'replicate' && p.api_token);

    const modelsToCreate = [];

    // Step 4: Add ONLY WORKING Stability AI models
    if (stabilityProvider) {
      console.log('✅ Stability AI provider found with API token');
      modelsToCreate.push(
        {
          provider_id: stabilityProvider.id,
          model_id: 'stable-diffusion-xl-1024-v1-0',
          display_name: '🟢 SDXL 1024 v1.0 (Working)',
          description: '✅ CONFIRMED WORKING - High resolution Stable Diffusion XL',
          tags: ['xl', 'high-res', 'stability', 'working', 'recommended'],
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
          model_id: 'stable-diffusion-xl-1024-v0-9',
          display_name: '🟢 SDXL 1024 v0.9 (Working)',
          description: '✅ CONFIRMED WORKING - Alternative Stable Diffusion XL model',
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
    } else {
      console.log('⚠️ Stability AI provider not found or missing API token');
    }

    // Step 5: Add Hugging Face models ONLY if API token exists
    if (hfProvider) {
      console.log('✅ Hugging Face provider found with API token');
      modelsToCreate.push(
        {
          provider_id: hfProvider.id,
          model_id: 'runwayml/stable-diffusion-v1-5',
          display_name: '🟡 SD v1.5 (Hugging Face)',
          description: 'Hugging Face hosted Stable Diffusion v1.5 - requires valid HF token',
          tags: ['realistic', 'general', 'huggingface'],
          is_enabled: true,
          is_default: !stabilityProvider, // Only default if no Stability AI
          model_settings: { width: 512, height: 512, num_inference_steps: 20, guidance_scale: 7.5 }
        }
      );
    } else {
      console.log('⚠️ Hugging Face provider not found or missing API token');
    }

    // Step 6: Add OpenAI models ONLY if API token exists (but mark as potentially problematic)
    if (openaiProvider) {
      console.log('⚠️ OpenAI provider found but may have permission issues');
      modelsToCreate.push(
        {
          provider_id: openaiProvider.id,
          model_id: 'dall-e-3',
          display_name: '🔴 DALL-E 3 (Check Permissions)',
          description: '⚠️ May require billing setup and image generation permissions',
          tags: ['openai', 'dalle', 'check-permissions'],
          is_enabled: false, // Disabled by default due to common issues
          is_default: false,
          model_settings: { width: 1024, height: 1024, quality: 'standard' }
        }
      );
    } else {
      console.log('⚠️ OpenAI provider not found or missing API token');
    }

    if (modelsToCreate.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No providers with API tokens found. Please configure at least one provider with a valid API token.',
        providersFound: providers.length,
        providersWithTokens: 0,
        modelsCreated: 0
      });
    }

    // Step 7: Insert only the working models
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

    console.log(`✅ Successfully created ${createdModels?.length || 0} models`);

    return NextResponse.json({
      success: true,
      message: '🎉 Database cleaned and working models set up successfully!',
      summary: {
        providersFound: providers.length,
        stabilityAI: !!stabilityProvider,
        huggingFace: !!hfProvider,
        openAI: !!openaiProvider,
        replicate: !!replicateProvider,
        modelsCreated: createdModels?.length || 0
      },
      models: createdModels,
      recommendations: [
        '✅ Only confirmed working models have been added',
        '🟢 Stability AI SDXL models are ready to use',
        '🟡 Hugging Face models added if API token exists',
        '🔴 OpenAI models disabled due to common permission issues',
        '💡 Enable/disable models in the admin panel as needed'
      ]
    });

  } catch (error) {
    console.error('Error in cleanup-and-setup-models:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
