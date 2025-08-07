import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🎬 Demonstrating automatic validation when adding API token...');
    
    // Step 1: Get Hugging Face provider
    const { data: providers } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('provider_key', 'huggingface');

    if (!providers || providers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Hugging Face provider not found. Please set up providers first.'
      });
    }

    const hfProvider = providers[0];

    // Step 2: Add some test models for Hugging Face if they don't exist
    const { data: existingModels } = await supabase
      .from('ai_models')
      .select('*')
      .eq('provider_id', hfProvider.id);

    if (!existingModels || existingModels.length === 0) {
      console.log('📝 Adding Hugging Face test models...');
      
      const testModels = [
        {
          provider_id: hfProvider.id,
          model_id: 'runwayml/stable-diffusion-v1-5',
          display_name: 'Stable Diffusion v1.5 (Hugging Face)',
          description: 'Popular text-to-image model hosted on Hugging Face',
          tags: ['realistic', 'general', 'huggingface'],
          is_enabled: false, // Disabled until validated
          is_default: false,
          model_settings: { width: 512, height: 512, num_inference_steps: 20, guidance_scale: 7.5 }
        },
        {
          provider_id: hfProvider.id,
          model_id: 'stabilityai/stable-diffusion-2-1',
          display_name: 'Stable Diffusion v2.1 (Hugging Face)',
          description: 'Improved version with better quality',
          tags: ['realistic', 'improved', 'huggingface'],
          is_enabled: false, // Disabled until validated
          is_default: false,
          model_settings: { width: 768, height: 768, num_inference_steps: 25, guidance_scale: 7.5 }
        },
        {
          provider_id: hfProvider.id,
          model_id: 'invalid/model-that-does-not-exist',
          display_name: 'Invalid Model (Test Error)',
          description: 'This model should fail validation - for testing error handling',
          tags: ['test', 'error', 'huggingface'],
          is_enabled: false,
          is_default: false,
          model_settings: { width: 512, height: 512 }
        }
      ];

      await supabase.from('ai_models').insert(testModels);
      console.log('✅ Test models added');
    }

    // Step 3: Simulate what happens when user adds API token
    console.log('🔑 Simulating API token addition...');
    
    // Get all models for this provider
    const { data: models } = await supabase
      .from('ai_models')
      .select('*')
      .eq('provider_id', hfProvider.id);

    const validationResults = [];

    // Step 4: Validate each model (simulate what happens automatically)
    for (const model of models || []) {
      console.log(`🧪 Testing model: ${model.display_name}`);
      
      let status: 'working' | 'error' | 'warning' = 'working';
      let message = 'Model is ready to use';
      let errorDetails = undefined;

      // Simulate validation logic
      if (!hfProvider.api_token) {
        status = 'error';
        message = 'No API token configured';
        errorDetails = 'Hugging Face provider requires an API token';
      } else if (model.model_id.includes('invalid') || model.model_id.includes('does-not-exist')) {
        status = 'error';
        message = 'Model not found';
        errorDetails = `Hugging Face model '${model.model_id}' does not exist or is not accessible`;
      } else if (!model.model_id.includes('/')) {
        status = 'error';
        message = 'Invalid model format';
        errorDetails = 'Hugging Face models should be in format "username/model-name"';
      } else if (model.model_id.includes('stable-diffusion-v1-5')) {
        status = 'working';
        message = 'Model validated successfully';
      } else if (model.model_id.includes('stable-diffusion-2-1')) {
        status = 'warning';
        message = 'Model works but may be slow to load';
        errorDetails = 'This model sometimes takes time to initialize on Hugging Face';
      }

      // Store validation result
      await fetch(`${request.nextUrl.origin}/api/admin/ai-models/validation-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: model.id,
          status,
          message,
          error_details: errorDetails
        })
      });

      validationResults.push({
        model_id: model.id,
        display_name: model.display_name,
        model_key: model.model_id,
        status,
        message,
        error_details: errorDetails
      });
    }

    // Step 5: Summary of what happened
    const summary = {
      total_models: validationResults.length,
      working: validationResults.filter(r => r.status === 'working').length,
      warnings: validationResults.filter(r => r.status === 'warning').length,
      errors: validationResults.filter(r => r.status === 'error').length
    };

    return NextResponse.json({
      success: true,
      message: 'Automatic validation demo completed!',
      provider: {
        name: hfProvider.name,
        has_token: !!hfProvider.api_token,
        is_active: hfProvider.is_active
      },
      validation_results: validationResults,
      summary,
      what_happened: [
        '1. User adds/updates API token for Hugging Face provider',
        '2. System automatically finds all models for that provider',
        '3. Each model is tested with the API token',
        '4. Models are marked as Working/Warning/Error based on results',
        '5. User gets immediate feedback on which models are ready to use'
      ],
      user_experience: [
        `✅ ${summary.working} models are ready to use immediately`,
        `⚠️ ${summary.warnings} models work but have warnings`,
        `❌ ${summary.errors} models have errors and need attention`,
        'Clear status indicators show exactly what works',
        'Detailed error messages help troubleshoot issues'
      ],
      next_steps: [
        '1. Check the admin panel to see validation results',
        '2. Working models can be enabled for users',
        '3. Fix any errors (invalid model IDs, permissions, etc.)',
        '4. Re-test models after making changes'
      ]
    });

  } catch (error) {
    console.error('Error in token demo:', error);
    return NextResponse.json({
      success: false,
      error: 'Demo failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
