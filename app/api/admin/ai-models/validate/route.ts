import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface ValidationResult {
  model_id: string;
  display_name: string;
  provider_key: string;
  status: 'working' | 'error' | 'warning' | 'testing';
  message: string;
  error_details?: string;
  response_time?: number;
  last_tested: string;
}

export async function POST(request: NextRequest) {
  try {
    const { model_ids } = await request.json();
    const supabase = await createServerSupabaseClient();
    
    // Get models with their providers
    const { data: models, error } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (*)
      `)
      .in('id', model_ids || []);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch models', details: error });
    }

    const results: ValidationResult[] = [];

    for (const model of models || []) {
      const provider = model.ai_providers;
      const startTime = Date.now();
      
      let validationResult: ValidationResult = {
        model_id: model.id,
        display_name: model.display_name,
        provider_key: provider.provider_key,
        status: 'testing',
        message: 'Testing model...',
        last_tested: new Date().toISOString()
      };

      try {
        // Test the model based on provider
        const testResult = await testModel(model, provider);
        validationResult = { ...validationResult, ...testResult };
        validationResult.response_time = Date.now() - startTime;
        
        // Store validation status in cache
        await fetch(`${request.nextUrl.origin}/api/admin/ai-models/validation-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model_id: model.id,
            status: validationResult.status,
            message: validationResult.message,
            error_details: validationResult.error_details
          })
        });

      } catch (error) {
        validationResult.status = 'error';
        validationResult.message = 'Validation failed';
        validationResult.error_details = error instanceof Error ? error.message : 'Unknown error';
        validationResult.response_time = Date.now() - startTime;
      }

      results.push(validationResult);
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        working: results.filter(r => r.status === 'working').length,
        errors: results.filter(r => r.status === 'error').length,
        warnings: results.filter(r => r.status === 'warning').length
      }
    });

  } catch (error) {
    console.error('Error validating models:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testModel(model: any, provider: any): Promise<Partial<ValidationResult>> {
  // Check basic requirements
  if (!provider.api_token) {
    return {
      status: 'error',
      message: 'No API token configured',
      error_details: 'Provider requires an API token to function'
    };
  }

  if (!provider.is_active) {
    return {
      status: 'warning',
      message: 'Provider is inactive',
      error_details: 'Provider is disabled in settings'
    };
  }

  // Test based on provider type
  switch (provider.provider_key) {
    case 'stability':
      return await testStabilityAI(model, provider);
    case 'huggingface':
      return await testHuggingFace(model, provider);
    case 'openai':
      return await testOpenAI(model, provider);
    case 'replicate':
      return await testReplicate(model, provider);
    default:
      return {
        status: 'error',
        message: 'Unsupported provider',
        error_details: `Provider type '${provider.provider_key}' is not supported`
      };
  }
}

async function testStabilityAI(model: any, provider: any): Promise<Partial<ValidationResult>> {
  try {
    // Test with a simple request to check if the engine exists
    const response = await fetch(`${provider.base_url}/generation/${model.model_id}/text-to-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: "test" }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        steps: 10,
        samples: 1
      }),
    });

    if (response.status === 404) {
      return {
        status: 'error',
        message: 'Model not found',
        error_details: `Stability AI engine '${model.model_id}' does not exist`
      };
    }

    if (response.status === 401) {
      return {
        status: 'error',
        message: 'Invalid API token',
        error_details: 'Stability AI API token is invalid or expired'
      };
    }

    if (response.status === 402) {
      return {
        status: 'warning',
        message: 'Insufficient credits',
        error_details: 'Stability AI account has insufficient credits'
      };
    }

    // If we get here, the model exists and token is valid
    return {
      status: 'working',
      message: 'Model is ready to use'
    };

  } catch (error) {
    return {
      status: 'error',
      message: 'Connection failed',
      error_details: error instanceof Error ? error.message : 'Network error'
    };
  }
}

async function testHuggingFace(model: any, provider: any): Promise<Partial<ValidationResult>> {
  try {
    const apiUrl = `${provider.base_url}/${model.model_id}`;
    
    // Test with a simple request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: "test",
        parameters: { width: 512, height: 512 }
      }),
    });

    if (response.status === 404) {
      return {
        status: 'error',
        message: 'Model not found',
        error_details: `Hugging Face model '${model.model_id}' does not exist or is not accessible`
      };
    }

    if (response.status === 401) {
      return {
        status: 'error',
        message: 'Invalid API token',
        error_details: 'Hugging Face API token is invalid or expired'
      };
    }

    if (response.status === 503) {
      return {
        status: 'warning',
        message: 'Model loading',
        error_details: 'Model is currently loading, try again in a few moments'
      };
    }

    return {
      status: 'working',
      message: 'Model is ready to use'
    };

  } catch (error) {
    return {
      status: 'error',
      message: 'Connection failed',
      error_details: error instanceof Error ? error.message : 'Network error'
    };
  }
}

async function testOpenAI(model: any, provider: any): Promise<Partial<ValidationResult>> {
  try {
    // Test with a simple request to check permissions
    const response = await fetch(`${provider.base_url}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model_id,
        prompt: "test",
        n: 1,
        size: "1024x1024"
      }),
    });

    if (response.status === 401) {
      return {
        status: 'error',
        message: 'Invalid API token or insufficient permissions',
        error_details: 'OpenAI API token lacks image generation permissions'
      };
    }

    if (response.status === 400) {
      const errorData = await response.json();
      if (errorData.error?.code === 'billing_hard_limit_reached') {
        return {
          status: 'error',
          message: 'Billing limit reached',
          error_details: 'OpenAI account has reached billing limits'
        };
      }
    }

    return {
      status: 'working',
      message: 'Model is ready to use'
    };

  } catch (error) {
    return {
      status: 'error',
      message: 'Connection failed',
      error_details: error instanceof Error ? error.message : 'Network error'
    };
  }
}

async function testReplicate(model: any, provider: any): Promise<Partial<ValidationResult>> {
  try {
    // Test with a simple request to check if model version exists
    const response = await fetch(`${provider.base_url}/models/${model.model_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${provider.api_token}`,
      },
    });

    if (response.status === 404) {
      return {
        status: 'error',
        message: 'Model not found',
        error_details: `Replicate model version '${model.model_id}' does not exist`
      };
    }

    if (response.status === 401) {
      return {
        status: 'error',
        message: 'Invalid API token',
        error_details: 'Replicate API token is invalid or expired'
      };
    }

    return {
      status: 'working',
      message: 'Model is ready to use'
    };

  } catch (error) {
    return {
      status: 'error',
      message: 'Connection failed',
      error_details: error instanceof Error ? error.message : 'Network error'
    };
  }
}
