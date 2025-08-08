import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🚀 Adding Modelabs (ModelsLab) as new AI provider...');
    
    // Step 1: Check if Modelabs provider already exists
    const { data: existingProvider } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('provider_key', 'modelabs')
      .single();

    if (existingProvider) {
      return NextResponse.json({
        success: false,
        error: 'Modelabs provider already exists',
        existing_provider: {
          id: existingProvider.id,
          name: existingProvider.name,
          is_active: existingProvider.is_active,
          has_api_token: !!existingProvider.api_token
        },
        message: 'Use the admin panel to update the existing Modelabs provider'
      });
    }

    // Step 2: Create Modelabs provider
    console.log('1. Creating Modelabs provider...');
    
    const { data: newProvider, error: providerError } = await supabase
      .from('ai_providers')
      .insert({
        name: 'Modelabs',
        provider_key: 'modelabs',
        base_url: 'https://modelslab.com/api/v6',
        is_active: false, // Inactive until API token is added
        settings: { 
          timeout: 60, 
          max_retries: 3,
          default_scheduler: 'UniPCMultistepScheduler',
          default_safety_checker: 'no',
          default_enhance_prompt: 'yes'
        }
      })
      .select()
      .single();

    if (providerError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create Modelabs provider',
        details: providerError.message
      });
    }

    console.log('✅ Modelabs provider created successfully');

    // Step 3: Add popular Modelabs models
    console.log('2. Adding popular Modelabs models...');
    
    const modelsToAdd = [
      {
        provider_id: newProvider.id,
        model_id: 'realistic-vision-v5',
        display_name: 'Realistic Vision v5.0 (Modelabs)',
        description: 'High-quality realistic image generation model with excellent detail',
        tags: ['realistic', 'photorealistic', 'detailed', 'modelabs'],
        is_enabled: false, // Disabled until provider is configured
        is_default: false,
        model_settings: {
          width: 512,
          height: 512,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          scheduler: 'UniPCMultistepScheduler',
          safety_checker: 'no',
          enhance_prompt: 'yes'
        }
      },
      {
        provider_id: newProvider.id,
        model_id: 'deliberate-v2',
        display_name: 'Deliberate v2 (Modelabs)',
        description: 'Versatile model for both realistic and artistic image generation',
        tags: ['versatile', 'artistic', 'realistic', 'modelabs'],
        is_enabled: false,
        is_default: false,
        model_settings: {
          width: 512,
          height: 512,
          num_inference_steps: 25,
          guidance_scale: 7.0,
          scheduler: 'UniPCMultistepScheduler',
          safety_checker: 'no',
          enhance_prompt: 'yes'
        }
      },
      {
        provider_id: newProvider.id,
        model_id: 'dreamshaper-v8',
        display_name: 'DreamShaper v8 (Modelabs)',
        description: 'Popular model for creative and artistic image generation',
        tags: ['creative', 'artistic', 'popular', 'modelabs'],
        is_enabled: false,
        is_default: false,
        model_settings: {
          width: 512,
          height: 512,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          scheduler: 'UniPCMultistepScheduler',
          safety_checker: 'no',
          enhance_prompt: 'yes'
        }
      },
      {
        provider_id: newProvider.id,
        model_id: 'anything-v5',
        display_name: 'Anything v5 (Modelabs)',
        description: 'Anime and illustration focused model with vibrant results',
        tags: ['anime', 'illustration', 'vibrant', 'modelabs'],
        is_enabled: false,
        is_default: false,
        model_settings: {
          width: 512,
          height: 512,
          num_inference_steps: 28,
          guidance_scale: 8.0,
          scheduler: 'UniPCMultistepScheduler',
          safety_checker: 'no',
          enhance_prompt: 'yes'
        }
      }
    ];

    const { data: newModels, error: modelsError } = await supabase
      .from('ai_models')
      .insert(modelsToAdd)
      .select();

    if (modelsError) {
      console.error('Error creating models:', modelsError);
      // Don't fail the entire operation if models fail
    }

    console.log(`✅ Added ${newModels?.length || 0} Modelabs models`);

    return NextResponse.json({
      success: true,
      message: 'Modelabs provider added successfully!',
      provider: {
        id: newProvider.id,
        name: newProvider.name,
        provider_key: newProvider.provider_key,
        base_url: newProvider.base_url,
        is_active: newProvider.is_active,
        has_api_token: false
      },
      models_added: newModels?.length || 0,
      models: newModels?.map(m => ({
        id: m.id,
        model_id: m.model_id,
        display_name: m.display_name,
        is_enabled: m.is_enabled
      })),
      next_steps: [
        '1. Go to Admin > AI Models > Providers',
        '2. Find the Modelabs provider',
        '3. Click "Edit" and add your Modelabs API key',
        '4. Activate the provider',
        '5. Test the models to validate they work',
        '6. Enable the models you want to use'
      ],
      api_info: {
        endpoint: 'https://modelslab.com/api/v6/images/text2img',
        authentication: 'API key in request body',
        documentation: 'https://docs.modelslab.com/',
        pricing: 'Check https://modelslab.com/ for current pricing'
      },
      integration_status: {
        provider_created: true,
        models_added: !!newModels,
        validation_ready: false,
        generation_ready: false,
        requires_api_key: true
      }
    });

  } catch (error: any) {
    console.error('Error adding Modelabs provider:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add Modelabs provider',
      details: error.message
    });
  }
}
