import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // First, let's create multiple providers
    const providers = [
      {
        name: 'Hugging Face',
        provider_key: 'huggingface',
        base_url: 'https://api-inference.huggingface.co',
        is_active: true,
        settings: { timeout: 30, max_retries: 3 }
      },
      {
        name: 'OpenAI',
        provider_key: 'openai',
        base_url: 'https://api.openai.com/v1',
        is_active: false, // Inactive by default
        settings: { timeout: 60, max_retries: 2 }
      },
      {
        name: 'Replicate',
        provider_key: 'replicate',
        base_url: 'https://api.replicate.com/v1',
        is_active: false,
        settings: { timeout: 120, max_retries: 3 }
      },
      {
        name: 'Stability AI',
        provider_key: 'stability',
        base_url: 'https://api.stability.ai/v1',
        is_active: false,
        settings: { timeout: 60, max_retries: 2 }
      }
    ];

    const { data: createdProviders, error: hfError } = await supabase
      .from('ai_providers')
      .upsert(providers, {
        onConflict: 'provider_key'
      })
      .select();

    if (hfError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create providers',
        details: hfError
      });
    }

    // Get the Hugging Face provider for model updates
    const hfProvider = createdProviders?.find(p => p.provider_key === 'huggingface');

    if (hfError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create Hugging Face provider',
        details: hfError
      });
    }

    // Now let's update the existing model to use the correct provider
    const { data: updatedModel, error: modelError } = await supabase
      .from('ai_models')
      .update({
        provider_id: hfProvider.id
      })
      .eq('model_id', 'runwayml/stable-diffusion-v1-5')
      .select();

    // Also check if we need to update any orphaned models
    const { data: orphanedModels } = await supabase
      .from('ai_models')
      .select('*')
      .is('provider_id', null);

    if (orphanedModels && orphanedModels.length > 0) {
      await supabase
        .from('ai_models')
        .update({ provider_id: hfProvider.id })
        .is('provider_id', null);
    }

    if (modelError) {
      console.error('Model update error:', modelError);
      // Don't fail the whole process if model update fails
    }

    // Let's also add a few more popular Hugging Face models
    const additionalModels = [
      {
        provider_id: hfProvider.id,
        model_id: 'stabilityai/stable-diffusion-2-1',
        display_name: 'Stable Diffusion v2.1',
        description: 'Improved version with better quality and composition',
        tags: ['realistic', 'improved', 'quality'],
        is_enabled: true,
        is_default: false,
        model_settings: {
          width: 768,
          height: 768,
          num_inference_steps: 25,
          guidance_scale: 7.5
        }
      },
      {
        provider_id: hfProvider.id,
        model_id: 'CompVis/stable-diffusion-v1-4',
        display_name: 'Stable Diffusion v1.4',
        description: 'Original Stable Diffusion model, good for artistic styles',
        tags: ['artistic', 'original', 'creative'],
        is_enabled: true,
        is_default: false,
        model_settings: {
          width: 512,
          height: 512,
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      }
    ];

    // Enable all providers equally - no prioritization
    await supabase
      .from('ai_providers')
      .update({ is_active: true })
      .in('provider_key', ['huggingface', 'openai', 'replicate', 'stability']);

    // Enable all models equally - no prioritization
    await supabase
      .from('ai_models')
      .update({ is_enabled: true });

    // Set a default model only if none exists
    const { data: defaultModel } = await supabase
      .from('ai_models')
      .select('id')
      .eq('is_default', true)
      .limit(1);

    if (!defaultModel || defaultModel.length === 0) {
      // Set the first available model as default
      const { data: firstModel } = await supabase
        .from('ai_models')
        .select('id')
        .limit(1);

      if (firstModel && firstModel.length > 0) {
        await supabase
          .from('ai_models')
          .update({ is_default: true })
          .eq('id', firstModel[0].id);
      }
    }

    const { data: newModels, error: newModelsError } = await supabase
      .from('ai_models')
      .upsert(additionalModels, {
        onConflict: 'model_id'
      })
      .select();

    return NextResponse.json({
      success: true,
      message: 'AI setup fixed successfully',
      providers: createdProviders,
      hfProvider,
      updatedModel,
      newModels: newModels || []
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error
    });
  }
}
