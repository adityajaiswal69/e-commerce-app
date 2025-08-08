import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🧪 Testing Modelabs integration...');
    
    // Get Modelabs provider and models
    const { data: provider, error: providerError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('provider_key', 'modelabs')
      .single();

    if (providerError || !provider) {
      return NextResponse.json({
        success: false,
        error: 'Modelabs provider not found',
        details: providerError?.message || 'Provider not configured',
        setup_required: true,
        setup_instructions: [
          '1. Run /api/add-modelabs-provider to add the provider',
          '2. Go to Admin > AI Models > Providers',
          '3. Add your Modelabs API key',
          '4. Activate the provider'
        ]
      });
    }

    const { data: models, error: modelsError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('provider_id', provider.id);

    if (modelsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch Modelabs models',
        details: modelsError.message
      });
    }

    // Test results
    const testResults = {
      provider_status: {
        exists: true,
        name: provider.name,
        provider_key: provider.provider_key,
        base_url: provider.base_url,
        is_active: provider.is_active,
        has_api_token: !!provider.api_token,
        settings: provider.settings
      },
      models_status: {
        total_models: models?.length || 0,
        models: models?.map(m => ({
          model_id: m.model_id,
          display_name: m.display_name,
          is_enabled: m.is_enabled,
          is_default: m.is_default
        })) || []
      },
      integration_status: {
        provider_configured: !!provider,
        models_available: (models?.length || 0) > 0,
        api_token_configured: !!provider.api_token,
        provider_active: provider.is_active,
        ready_for_testing: !!provider.api_token && provider.is_active
      }
    };

    // If API token is configured, test the API
    let apiTest = null;
    if (provider.api_token && models && models.length > 0) {
      console.log('Testing Modelabs API...');
      
      const testModel = models[0];
      try {
        const apiUrl = `${provider.base_url}/images/text2img`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: provider.api_token,
            model_id: testModel.model_id,
            prompt: "test image generation",
            width: "512",
            height: "512",
            samples: "1",
            num_inference_steps: "20",
            safety_checker: "no",
            enhance_prompt: "yes",
            guidance_scale: 7.5,
            scheduler: "UniPCMultistepScheduler"
          }),
        });

        apiTest = {
          model_tested: testModel.model_id,
          api_url: apiUrl,
          status_code: response.status,
          success: response.ok,
          message: response.ok ? 'API test successful' : 'API test failed',
          details: response.ok ? 'Modelabs API is working correctly' : await response.text()
        };

        console.log(`API test result: ${response.status} - ${response.ok ? 'SUCCESS' : 'FAILED'}`);

      } catch (testError: any) {
        apiTest = {
          model_tested: testModel.model_id,
          success: false,
          message: 'API test error',
          details: testError.message
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Modelabs integration status',
      ...testResults,
      api_test: apiTest,
      recommendations: generateRecommendations(testResults, apiTest),
      next_steps: generateNextSteps(testResults, apiTest),
      modelabs_info: {
        website: 'https://modelslab.com/',
        documentation: 'https://docs.modelslab.com/',
        api_endpoint: 'https://modelslab.com/api/v6/images/text2img',
        features: [
          'Text-to-image generation',
          'Multiple Stable Diffusion models',
          'LoRA support',
          'Custom schedulers',
          'Prompt enhancement',
          'Safety checking'
        ]
      }
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Integration test failed',
      details: error.message
    });
  }
}

function generateRecommendations(testResults: any, apiTest: any): string[] {
  const recommendations = [];

  if (!testResults.provider_status.has_api_token) {
    recommendations.push('🔑 Add your Modelabs API key in the admin panel');
  }

  if (!testResults.provider_status.is_active) {
    recommendations.push('⚡ Activate the Modelabs provider');
  }

  if (testResults.models_status.total_models === 0) {
    recommendations.push('📦 Add some Modelabs models');
  }

  if (testResults.models_status.models.every((m: any) => !m.is_enabled)) {
    recommendations.push('✅ Enable at least one Modelabs model');
  }

  if (apiTest?.success) {
    recommendations.push('🎉 Modelabs integration is working perfectly!');
    recommendations.push('🎨 Try generating images with Modelabs models');
  } else if (apiTest && !apiTest.success) {
    recommendations.push('🔧 Fix API configuration - check your API key');
  }

  return recommendations;
}

function generateNextSteps(testResults: any, apiTest: any): string[] {
  const steps = [];

  if (!testResults.integration_status.provider_configured) {
    steps.push('1. Run /api/add-modelabs-provider');
    return steps;
  }

  if (!testResults.provider_status.has_api_token) {
    steps.push('1. Go to Admin > AI Models > Providers');
    steps.push('2. Find Modelabs provider and click Edit');
    steps.push('3. Add your Modelabs API key');
    steps.push('4. Save the configuration');
  }

  if (!testResults.provider_status.is_active) {
    steps.push('5. Activate the Modelabs provider');
  }

  if (testResults.models_status.models.every((m: any) => !m.is_enabled)) {
    steps.push('6. Enable the Modelabs models you want to use');
  }

  if (testResults.integration_status.ready_for_testing) {
    steps.push('7. Test model validation in admin panel');
    steps.push('8. Try generating images with Modelabs');
  }

  return steps;
}
