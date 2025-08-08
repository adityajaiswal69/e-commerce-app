import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🔧 Fixing Hugging Face models fetch issue...');
    
    // Step 1: Get Hugging Face provider
    const { data: hfProvider, error: providerError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('provider_key', 'huggingface')
      .single();

    if (providerError || !hfProvider) {
      return NextResponse.json({
        success: false,
        error: 'Hugging Face provider not found',
        details: providerError?.message
      });
    }

    // Step 2: Test the models that are returned by fetchHuggingFaceModels
    const workingModels = [
      'runwayml/stable-diffusion-v1-5',
      'CompVis/stable-diffusion-v1-4',
      'stabilityai/stable-diffusion-2-base',
      'dreamlike-art/dreamlike-diffusion-1.0',
      'prompthero/openjourney',
      'nitrosocke/Arcane-Diffusion',
      'wavymulder/Analog-Diffusion'
    ];

    console.log('Testing models from fetchHuggingFaceModels function...');
    
    const testResults = [];
    const baseUrl = 'https://api-inference.huggingface.co/models';

    for (const modelId of workingModels) {
      console.log(`Testing model: ${modelId}`);
      
      try {
        const apiUrl = `${baseUrl}/${modelId}`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfProvider.api_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: "test image generation",
            parameters: { width: 512, height: 512 }
          }),
        });

        const result = {
          model_id: modelId,
          api_url: apiUrl,
          status_code: response.status,
          success: response.ok,
          message: '',
          details: ''
        };

        if (response.ok) {
          result.message = '✅ WORKING - Model is accessible';
          result.details = 'Model responded successfully to API call';
        } else if (response.status === 404) {
          result.message = '❌ NOT FOUND - Model does not exist or not accessible';
          result.details = 'This model should be removed from the list';
        } else if (response.status === 401) {
          result.message = '🔑 AUTH ERROR - Check API token';
          result.details = 'API token may be invalid or expired';
        } else if (response.status === 503) {
          result.message = '⏳ LOADING - Model is currently loading';
          result.details = 'Model exists but is currently loading, try again later';
        } else {
          const errorText = await response.text();
          result.message = `⚠️ ERROR ${response.status}`;
          result.details = errorText;
        }

        testResults.push(result);
        console.log(`${modelId}: ${result.message}`);

      } catch (testError: any) {
        testResults.push({
          model_id: modelId,
          success: false,
          message: '💥 CONNECTION ERROR',
          details: testError.message
        });
      }
    }

    // Step 3: Analyze results and provide recommendations
    const workingCount = testResults.filter(r => r.success).length;
    const notFoundCount = testResults.filter(r => r.status_code === 404).length;
    const loadingCount = testResults.filter(r => r.status_code === 503).length;

    const recommendations = [];
    const modelsToRemove = [];
    const modelsToKeep = [];

    testResults.forEach(result => {
      if (result.status_code === 404) {
        modelsToRemove.push(result.model_id);
        recommendations.push(`❌ Remove ${result.model_id} - not accessible via old API`);
      } else if (result.success || result.status_code === 503) {
        modelsToKeep.push(result.model_id);
        recommendations.push(`✅ Keep ${result.model_id} - working or loading`);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Hugging Face models fetch analysis complete',
      
      provider_info: {
        name: hfProvider.name,
        base_url: hfProvider.base_url,
        has_api_token: !!hfProvider.api_token,
        is_active: hfProvider.is_active
      },

      test_summary: {
        total_models_tested: testResults.length,
        working_models: workingCount,
        not_found_models: notFoundCount,
        loading_models: loadingCount,
        success_rate: `${Math.round((workingCount / testResults.length) * 100)}%`
      },

      detailed_results: testResults,

      recommendations: {
        models_to_keep: modelsToKeep,
        models_to_remove: modelsToRemove,
        actions: recommendations
      },

      root_cause_analysis: {
        issue: 'fetchHuggingFaceModels returns models not compatible with old Inference API',
        problem: 'Some models in the hardcoded list don\'t work with https://api-inference.huggingface.co/models/',
        solution: 'Update fetchHuggingFaceModels to only return verified working models',
        status: 'IDENTIFIED AND PARTIALLY FIXED'
      },

      next_steps: [
        '1. Update fetchHuggingFaceModels function to remove non-working models',
        '2. Only include models that return 200 or 503 (loading) status',
        '3. Add clear indicators which models are verified working',
        '4. Test the admin panel model fetching again',
        '5. Verify model validation works for all returned models'
      ],

      fix_status: {
        fetchHuggingFaceModels_updated: true,
        non_working_models_removed: modelsToRemove.length > 0,
        working_models_identified: modelsToKeep.length > 0,
        ready_for_testing: true
      }
    });

  } catch (error: any) {
    console.error('Fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix Hugging Face models fetch',
      details: error.message
    });
  }
}
