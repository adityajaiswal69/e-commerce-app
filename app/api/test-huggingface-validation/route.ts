import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🧪 Testing Hugging Face model validation...');
    
    // Get Hugging Face models
    const { data: models, error } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (*)
      `)
      .eq('ai_providers.provider_key', 'huggingface')
      .eq('is_enabled', true);

    if (error || !models || models.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No Hugging Face models found',
        details: error?.message || 'No models available'
      });
    }

    const provider = models[0].ai_providers;
    
    if (!provider.api_token) {
      return NextResponse.json({
        success: false,
        error: 'No API token configured for Hugging Face',
        models_found: models.length,
        provider_config: {
          base_url: provider.base_url,
          is_active: provider.is_active
        }
      });
    }

    console.log(`Found ${models.length} Hugging Face models to test`);
    console.log(`Provider base URL: ${provider.base_url}`);

    const testResults = [];

    // Test each model
    for (const model of models) {
      console.log(`Testing model: ${model.model_id}`);
      
      const apiUrl = `${provider.base_url}/${model.model_id}`;
      
      try {
        const startTime = Date.now();
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.api_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: "a beautiful landscape",
            parameters: { 
              width: 512, 
              height: 512,
              num_inference_steps: 10 // Reduced for faster testing
            }
          }),
        });

        const responseTime = Date.now() - startTime;
        
        let result = {
          model_id: model.model_id,
          display_name: model.display_name,
          api_url: apiUrl,
          status_code: response.status,
          response_time_ms: responseTime,
          success: false,
          message: '',
          details: ''
        };

        if (response.ok) {
          // Check if we got an image blob
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          
          result.success = true;
          result.message = 'Model validation successful';
          result.details = `Content-Type: ${contentType}, Size: ${contentLength} bytes`;
          
          console.log(`✅ ${model.model_id}: SUCCESS (${responseTime}ms)`);
          
        } else {
          const errorText = await response.text();
          result.message = 'Model validation failed';
          result.details = errorText;
          
          // Specific error handling
          if (response.status === 404) {
            result.message = 'Model not found';
            result.details = 'This model is not available through the Hugging Face Inference API';
          } else if (response.status === 401) {
            result.message = 'Invalid API token';
            result.details = 'Check your Hugging Face API token configuration';
          } else if (response.status === 503) {
            result.message = 'Model loading';
            result.details = 'Model is currently loading, try again in a few moments';
          }
          
          console.log(`❌ ${model.model_id}: ${response.status} - ${result.message}`);
        }

        testResults.push(result);

      } catch (testError: any) {
        const result = {
          model_id: model.model_id,
          display_name: model.display_name,
          api_url: apiUrl,
          status_code: 0,
          response_time_ms: 0,
          success: false,
          message: 'Connection failed',
          details: testError.message
        };
        
        testResults.push(result);
        console.log(`💥 ${model.model_id}: ERROR - ${testError.message}`);
      }
    }

    // Summary
    const successCount = testResults.filter(r => r.success).length;
    const failCount = testResults.filter(r => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Tested ${models.length} Hugging Face models`,
      summary: {
        total_models: models.length,
        successful: successCount,
        failed: failCount,
        success_rate: `${Math.round((successCount / models.length) * 100)}%`
      },
      provider_info: {
        name: provider.name,
        base_url: provider.base_url,
        has_api_token: !!provider.api_token,
        is_active: provider.is_active
      },
      test_results: testResults,
      recommendations: successCount > 0 ? [
        '✅ Hugging Face validation is working!',
        'You can now use these models for image generation',
        'Go to the design page and try generating images'
      ] : [
        '❌ All models failed validation',
        'Check your Hugging Face API token',
        'Verify the token has proper permissions',
        'Try testing with a different model'
      ]
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
}
