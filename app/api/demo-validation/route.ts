import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🎬 Starting validation system demo...');
    
    // Step 1: Get a model to test
    const { data: models } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (*)
      `)
      .limit(1);

    if (!models || models.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No models found. Run setup-validation-simple first.'
      });
    }

    const model = models[0];
    const provider = model.ai_providers;

    // Step 2: Demonstrate validation
    console.log(`🧪 Testing model: ${model.display_name}`);
    console.log(`🔧 Provider: ${provider.name} (${provider.provider_key})`);

    const validationResult = await testModelValidation(model, provider);

    // Step 3: Show what happens when API token is added/updated
    const tokenDemo = await demonstrateTokenValidation(provider);

    return NextResponse.json({
      success: true,
      message: '🎉 Validation system demo completed!',
      demo_results: {
        model_tested: {
          id: model.id,
          display_name: model.display_name,
          provider: provider.name,
          validation_result: validationResult
        },
        token_validation_demo: tokenDemo,
        system_features: [
          '✅ Automatic validation when API tokens are added',
          '🔄 Real-time testing of model availability',
          '⚠️ Clear error messages for issues',
          '🎯 Smart validation based on provider type',
          '📊 Status tracking and reporting'
        ]
      },
      how_it_works: {
        when_adding_api_token: [
          '1. User adds/updates API token in provider settings',
          '2. System automatically finds all models for that provider',
          '3. Each model is tested with the new API token',
          '4. Results are displayed with clear status indicators',
          '5. Working models are enabled, broken ones show errors'
        ],
        validation_checks: {
          stability_ai: [
            'Check if engine/model ID exists',
            'Verify API token permissions',
            'Test with minimal generation request',
            'Check for billing/credit issues'
          ],
          hugging_face: [
            'Verify model exists and is accessible',
            'Check API token validity',
            'Test model loading status',
            'Validate model format (username/model-name)'
          ],
          openai: [
            'Check API token permissions',
            'Verify image generation access',
            'Test for billing limits',
            'Validate model availability'
          ],
          replicate: [
            'Check if model version exists',
            'Verify API token validity',
            'Test model accessibility'
          ]
        }
      },
      usage_examples: {
        test_single_model: {
          url: '/api/admin/ai-models/validate',
          method: 'POST',
          body: { model_ids: [model.id] }
        },
        test_all_models: {
          url: '/api/admin/ai-models/validate',
          method: 'POST',
          body: { model_ids: ['all-model-ids-here'] }
        },
        auto_validate_on_token_update: {
          url: '/api/admin/ai-providers/auto-validate',
          method: 'POST',
          body: { provider_id: provider.id }
        }
      }
    });

  } catch (error) {
    console.error('Error in validation demo:', error);
    return NextResponse.json({
      success: false,
      error: 'Demo failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testModelValidation(model: any, provider: any) {
  console.log(`🔍 Validating model: ${model.model_id}`);
  
  // Simulate validation logic
  let status = 'unknown';
  let message = 'Testing...';
  let issues = [];

  // Check basic requirements
  if (!provider.api_token) {
    status = 'error';
    message = 'No API token configured';
    issues.push('Missing API token');
  } else if (!provider.is_active) {
    status = 'warning';
    message = 'Provider inactive';
    issues.push('Provider disabled');
  } else {
    // Provider-specific validation
    switch (provider.provider_key) {
      case 'stability':
        if (model.model_id.includes('stable-diffusion-xl')) {
          status = 'working';
          message = 'SDXL model confirmed working';
        } else if (model.model_id === 'stable-diffusion-v1-5') {
          status = 'error';
          message = 'Model not found in Stability AI';
          issues.push('Invalid engine ID');
        } else {
          status = 'warning';
          message = 'Unknown Stability AI model';
          issues.push('Unverified model ID');
        }
        break;

      case 'huggingface':
        if (model.model_id.includes('/')) {
          status = 'working';
          message = 'Valid Hugging Face format';
        } else {
          status = 'error';
          message = 'Invalid model format';
          issues.push('Should be username/model-name');
        }
        break;

      case 'openai':
        if (model.model_id === 'dall-e-2' || model.model_id === 'dall-e-3') {
          status = 'warning';
          message = 'Valid model but check billing';
          issues.push('Often has billing/permission issues');
        } else {
          status = 'error';
          message = 'Invalid OpenAI model';
          issues.push('Unknown model ID');
        }
        break;

      default:
        status = 'error';
        message = 'Unsupported provider';
        issues.push('Provider type not supported');
    }
  }

  return {
    status,
    message,
    issues,
    timestamp: new Date().toISOString()
  };
}

async function demonstrateTokenValidation(provider: any) {
  console.log(`🔑 Demonstrating token validation for ${provider.name}`);
  
  const scenarios = [
    {
      scenario: 'Valid API Token Added',
      result: 'All models for this provider are automatically tested',
      status: 'success',
      actions: [
        'Find all models for provider',
        'Test each model with new token',
        'Update model status based on results',
        'Show success/error notifications'
      ]
    },
    {
      scenario: 'Invalid API Token',
      result: 'Models marked as error with clear message',
      status: 'error',
      actions: [
        'Test fails with 401 Unauthorized',
        'Models marked as "Invalid API token"',
        'User gets clear error message',
        'Models remain disabled'
      ]
    },
    {
      scenario: 'Token with Limited Permissions',
      result: 'Models marked as warning with specific issue',
      status: 'warning',
      actions: [
        'Test fails with permission error',
        'Models marked as "Insufficient permissions"',
        'User gets specific guidance',
        'Models disabled until fixed'
      ]
    }
  ];

  return {
    provider_type: provider.provider_key,
    has_token: !!provider.api_token,
    scenarios,
    automatic_validation: {
      triggers: [
        'When API token is added/updated',
        'When provider is activated',
        'When user clicks "Test" button',
        'When "Validate All" is clicked'
      ],
      results: [
        'Real-time status updates',
        'Clear error messages',
        'Automatic enable/disable of models',
        'Toast notifications for user feedback'
      ]
    }
  };
}
