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

/**
 * Fetch available models from Hugging Face
 */
async function fetchHuggingFaceModels(apiToken: string) {
  try {
    // Popular text-to-image models on Hugging Face
    const popularModels = [
      {
        id: 'runwayml/stable-diffusion-v1-5',
        name: 'Stable Diffusion v1.5',
        description: 'General purpose text-to-image model, great for realistic images',
        tags: ['realistic', 'general', 'popular'],
        settings: { width: 512, height: 512, num_inference_steps: 20, guidance_scale: 7.5 }
      },
      {
        id: 'stabilityai/stable-diffusion-2-1',
        name: 'Stable Diffusion v2.1',
        description: 'Improved version with better quality and composition',
        tags: ['realistic', 'improved', 'quality'],
        settings: { width: 768, height: 768, num_inference_steps: 25, guidance_scale: 7.5 }
      },
      {
        id: 'CompVis/stable-diffusion-v1-4',
        name: 'Stable Diffusion v1.4',
        description: 'Original Stable Diffusion model, good for artistic styles',
        tags: ['artistic', 'original', 'creative'],
        settings: { width: 512, height: 512, num_inference_steps: 20, guidance_scale: 7.5 }
      },
      {
        id: 'stabilityai/stable-diffusion-xl-base-1.0',
        name: 'Stable Diffusion XL',
        description: 'High-resolution model with excellent detail and composition',
        tags: ['high-res', 'detailed', 'xl'],
        settings: { width: 1024, height: 1024, num_inference_steps: 30, guidance_scale: 7.5 }
      },
      {
        id: 'dreamlike-art/dreamlike-diffusion-1.0',
        name: 'Dreamlike Diffusion',
        description: 'Artistic style model with dreamy, fantasy-like outputs',
        tags: ['artistic', 'fantasy', 'dreamy'],
        settings: { width: 512, height: 512, num_inference_steps: 25, guidance_scale: 8.0 }
      },
      {
        id: 'prompthero/openjourney',
        name: 'OpenJourney',
        description: 'Midjourney-style model for artistic and creative images',
        tags: ['artistic', 'midjourney', 'creative'],
        settings: { width: 512, height: 512, num_inference_steps: 25, guidance_scale: 7.0 }
      },
      {
        id: 'nitrosocke/Arcane-Diffusion',
        name: 'Arcane Diffusion',
        description: 'Specialized for Arcane/League of Legends art style',
        tags: ['arcane', 'game', 'stylized'],
        settings: { width: 512, height: 512, num_inference_steps: 20, guidance_scale: 7.5 }
      },
      {
        id: 'wavymulder/Analog-Diffusion',
        name: 'Analog Diffusion',
        description: 'Vintage analog photography style',
        tags: ['vintage', 'analog', 'photography'],
        settings: { width: 512, height: 512, num_inference_steps: 25, guidance_scale: 7.5 }
      }
    ];

    // For now, return popular models. In the future, we could call HF API to get actual model list
    return popularModels;
  } catch (error) {
    console.error('Error fetching Hugging Face models:', error);
    return [];
  }
}

/**
 * Fetch available models from OpenAI
 */
async function fetchOpenAIModels(apiToken: string) {
  try {
    const models = [
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        description: 'Latest DALL-E model with improved quality and prompt adherence',
        tags: ['latest', 'high-quality', 'prompt-adherence'],
        settings: { width: 1024, height: 1024, quality: 'standard' }
      },
      {
        id: 'dall-e-2',
        name: 'DALL-E 2',
        description: 'Previous generation DALL-E model',
        tags: ['stable', 'reliable'],
        settings: { width: 1024, height: 1024, quality: 'standard' }
      }
    ];

    return models;
  } catch (error) {
    console.error('Error fetching OpenAI models:', error);
    return [];
  }
}

/**
 * Fetch available models from Replicate
 */
async function fetchReplicateModels(apiToken: string) {
  try {
    // These are actual working model versions on Replicate
    const models = [
      {
        id: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        name: 'Stable Diffusion v1.5',
        description: 'Stable Diffusion v1.5 hosted on Replicate',
        tags: ['stable', 'replicate', 'v1.5'],
        settings: { width: 512, height: 512, num_inference_steps: 20, guidance_scale: 7.5 }
      },
      {
        id: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        name: 'SDXL (Replicate)',
        description: 'Stable Diffusion XL hosted on Replicate',
        tags: ['xl', 'high-res', 'replicate'],
        settings: { width: 1024, height: 1024, num_inference_steps: 30, guidance_scale: 7.5 }
      },
      {
        id: 'lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
        name: 'AnimateDiff',
        description: 'Create animated images with AnimateDiff',
        tags: ['animation', 'video', 'creative'],
        settings: { width: 512, height: 512, num_inference_steps: 25, guidance_scale: 7.5 }
      }
    ];

    return models;
  } catch (error) {
    console.error('Error fetching Replicate models:', error);
    return [];
  }
}

/**
 * Fetch available models from Stability AI
 */
async function fetchStabilityModels(apiToken: string) {
  try {
    // These are the actual engine IDs from Stability AI API
    const models = [
      {
        id: 'stable-diffusion-v1-5',
        name: 'Stable Diffusion v1.5',
        description: 'Classic Stable Diffusion model from Stability AI',
        tags: ['classic', 'reliable', 'stability'],
        settings: { width: 512, height: 512, steps: 20, cfg_scale: 7.5 }
      },
      {
        id: 'stable-diffusion-xl-1024-v1-0',
        name: 'SDXL 1024',
        description: 'High resolution Stable Diffusion XL',
        tags: ['xl', 'high-res', 'stability'],
        settings: { width: 1024, height: 1024, steps: 30, cfg_scale: 7.5 }
      },
      {
        id: 'stable-diffusion-xl-beta-v2-2-2',
        name: 'SDXL Beta v2.2.2',
        description: 'Beta version of Stable Diffusion XL',
        tags: ['beta', 'experimental', 'xl'],
        settings: { width: 1024, height: 1024, steps: 30, cfg_scale: 7.5 }
      }
    ];

    return models;
  } catch (error) {
    console.error('Error fetching Stability AI models:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const authCheck = await checkAdminAccess(supabase);

    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id: providerId } = await params;

    // Get provider information
    const { data: provider, error: providerError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (!provider.api_token) {
      return NextResponse.json(
        { error: 'API token not configured for this provider' },
        { status: 400 }
      );
    }

    let availableModels = [];

    // Fetch models based on provider type
    switch (provider.provider_key) {
      case 'huggingface':
        availableModels = await fetchHuggingFaceModels(provider.api_token);
        break;
      case 'openai':
        availableModels = await fetchOpenAIModels(provider.api_token);
        break;
      case 'replicate':
        availableModels = await fetchReplicateModels(provider.api_token);
        break;
      case 'stability':
        availableModels = await fetchStabilityModels(provider.api_token);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider.provider_key}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.name,
        provider_key: provider.provider_key
      },
      models: availableModels
    });

  } catch (error) {
    console.error('Error fetching provider models:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
