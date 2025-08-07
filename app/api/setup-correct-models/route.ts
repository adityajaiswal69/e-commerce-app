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
    const openaiProvider = providers.find(p => p.provider_key === 'openai');
    const replicateProvider = providers.find(p => p.provider_key === 'replicate');
    const stabilityProvider = providers.find(p => p.provider_key === 'stability');

    // Delete all existing models to start fresh
    await supabase.from('ai_models').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const modelsToCreate = [];

    // Hugging Face models
    if (hfProvider) {
      modelsToCreate.push(
        {
          provider_id: hfProvider.id,
          model_id: 'runwayml/stable-diffusion-v1-5',
          display_name: 'Stable Diffusion v1.5',
          description: 'General purpose text-to-image model, great for realistic images',
          tags: ['realistic', 'general', 'popular'],
          is_enabled: true,
          is_default: true,
          model_settings: { width: 512, height: 512, num_inference_steps: 20, guidance_scale: 7.5 }
        },
        {
          provider_id: hfProvider.id,
          model_id: 'stabilityai/stable-diffusion-2-1',
          display_name: 'Stable Diffusion v2.1',
          description: 'Improved version with better quality and composition',
          tags: ['realistic', 'improved', 'quality'],
          is_enabled: true,
          is_default: false,
          model_settings: { width: 768, height: 768, num_inference_steps: 25, guidance_scale: 7.5 }
        }
      );
    }

    // OpenAI models
    if (openaiProvider) {
      modelsToCreate.push(
        {
          provider_id: openaiProvider.id,
          model_id: 'dall-e-3',
          display_name: 'DALL-E 3',
          description: 'Latest DALL-E model with improved quality and prompt adherence',
          tags: ['latest', 'high-quality', 'openai'],
          is_enabled: true,
          is_default: false,
          model_settings: { width: 1024, height: 1024, quality: 'standard' }
        },
        {
          provider_id: openaiProvider.id,
          model_id: 'dall-e-2',
          display_name: 'DALL-E 2',
          description: 'Previous generation DALL-E model',
          tags: ['stable', 'reliable', 'openai'],
          is_enabled: true,
          is_default: false,
          model_settings: { width: 1024, height: 1024, quality: 'standard' }
        }
      );
    }

    // Replicate models (with correct version hashes)
    if (replicateProvider) {
      modelsToCreate.push(
        {
          provider_id: replicateProvider.id,
          model_id: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
          display_name: 'Stable Diffusion v1.5 (Replicate)',
          description: 'Stable Diffusion v1.5 hosted on Replicate',
          tags: ['stable', 'replicate', 'v1.5'],
          is_enabled: true,
          is_default: false,
          model_settings: { width: 512, height: 512, num_inference_steps: 20, guidance_scale: 7.5 }
        },
        {
          provider_id: replicateProvider.id,
          model_id: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
          display_name: 'SDXL (Replicate)',
          description: 'Stable Diffusion XL hosted on Replicate',
          tags: ['xl', 'high-res', 'replicate'],
          is_enabled: true,
          is_default: false,
          model_settings: { width: 1024, height: 1024, num_inference_steps: 30, guidance_scale: 7.5 }
        }
      );
    }

    // Stability AI models (ONLY working engines)
    if (stabilityProvider) {
      modelsToCreate.push(
        {
          provider_id: stabilityProvider.id,
          model_id: 'stable-diffusion-xl-1024-v1-0',
          display_name: 'SDXL 1024 v1.0 (Stability AI)',
          description: 'High resolution Stable Diffusion XL - Working model',
          tags: ['xl', 'high-res', 'stability', 'working'],
          is_enabled: true,
          is_default: false,
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
          display_name: 'SDXL 1024 v0.9 (Stability AI)',
          description: 'Stable Diffusion XL v0.9 - Alternative working model',
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
      message: 'Models created successfully with correct IDs',
      providersFound: providers.length,
      modelsCreated: createdModels?.length || 0,
      models: createdModels
    });

  } catch (error) {
    console.error('Error in setup-correct-models:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
