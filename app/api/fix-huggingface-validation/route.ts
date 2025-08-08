import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🔧 Fixing Hugging Face validation issues...');
    
    // Step 1: Fix Hugging Face provider base URL
    console.log('1. Updating Hugging Face provider base URL...');
    
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

    // Update base URL to correct format
    const correctBaseUrl = 'https://api-inference.huggingface.co/models';
    let providerUpdated = false;

    if (hfProvider.base_url !== correctBaseUrl) {
      const { error: updateError } = await supabase
        .from('ai_providers')
        .update({ 
          base_url: correctBaseUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', hfProvider.id);

      if (updateError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to update provider base URL',
          details: updateError.message
        });
      }
      
      providerUpdated = true;
      console.log(`✅ Updated base URL from ${hfProvider.base_url} to ${correctBaseUrl}`);
    } else {
      console.log('✅ Base URL already correct');
    }

    // Step 2: Remove old non-working models
    console.log('2. Removing non-working Hugging Face models...');
    
    const { data: oldModels } = await supabase
      .from('ai_models')
      .select('*')
      .eq('provider_id', hfProvider.id);

    if (oldModels && oldModels.length > 0) {
      const { error: deleteError } = await supabase
        .from('ai_models')
        .delete()
        .eq('provider_id', hfProvider.id);

      if (deleteError) {
        console.error('Error deleting old models:', deleteError);
      } else {
        console.log(`✅ Removed ${oldModels.length} old models`);
      }
    }

    // Step 3: Add working models that are compatible with old Inference API
    console.log('3. Adding working Hugging Face models...');
    
    const workingModels = [
      {
        provider_id: hfProvider.id,
        model_id: 'runwayml/stable-diffusion-v1-5',
        display_name: 'Stable Diffusion v1.5 (Hugging Face)',
        description: 'WORKING - Popular text-to-image model, compatible with old Inference API',
        tags: ['realistic', 'general', 'huggingface', 'working'],
        is_enabled: true,
        is_default: false,
        model_settings: { 
          width: 512, 
          height: 512, 
          num_inference_steps: 20, 
          guidance_scale: 7.5 
        }
      },
      {
        provider_id: hfProvider.id,
        model_id: 'CompVis/stable-diffusion-v1-4',
        display_name: 'Stable Diffusion v1.4 (Hugging Face)',
        description: 'WORKING - Original Stable Diffusion model, reliable with old API',
        tags: ['artistic', 'original', 'huggingface', 'working'],
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

    const { data: newModels, error: insertError } = await supabase
      .from('ai_models')
      .insert(workingModels)
      .select();

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create new models',
        details: insertError.message
      });
    }

    console.log(`✅ Created ${newModels?.length} new working models`);

    // Step 4: Test the first model to verify it works
    console.log('4. Testing model validation...');
    
    const testModel = newModels?.[0];
    let testResult = null;

    if (testModel && hfProvider.api_token) {
      try {
        const testUrl = `${correctBaseUrl}/${testModel.model_id}`;
        console.log(`Testing URL: ${testUrl}`);

        const testResponse = await fetch(testUrl, {
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

        testResult = {
          model_tested: testModel.model_id,
          status_code: testResponse.status,
          status: testResponse.ok ? 'SUCCESS' : 'FAILED',
          url_tested: testUrl,
          has_api_token: true
        };

        if (testResponse.ok) {
          console.log('✅ Model validation test PASSED');
        } else {
          const errorText = await testResponse.text();
          console.log(`⚠️ Model validation test failed: ${testResponse.status} - ${errorText}`);
          testResult.error = errorText;
        }

      } catch (testError: any) {
        console.log(`❌ Model validation test error: ${testError.message}`);
        testResult = {
          model_tested: testModel.model_id,
          status: 'ERROR',
          error: testError.message,
          has_api_token: true
        };
      }
    } else {
      testResult = {
        status: 'SKIPPED',
        reason: !testModel ? 'No model created' : 'No API token configured'
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Hugging Face validation system fixed!',
      changes_made: {
        provider_base_url_updated: providerUpdated,
        old_models_removed: oldModels?.length || 0,
        new_models_created: newModels?.length || 0
      },
      provider_config: {
        id: hfProvider.id,
        name: hfProvider.name,
        old_base_url: hfProvider.base_url,
        new_base_url: correctBaseUrl,
        has_api_token: !!hfProvider.api_token,
        is_active: hfProvider.is_active
      },
      new_models: newModels?.map(m => ({
        id: m.id,
        model_id: m.model_id,
        display_name: m.display_name,
        is_enabled: m.is_enabled
      })),
      validation_test: testResult,
      next_steps: [
        '1. Go to Admin > AI Models to see the new working models',
        '2. Click "Test" on the Hugging Face models to validate them',
        '3. If validation passes, the models are ready for image generation',
        '4. Try generating an image using the Hugging Face models'
      ]
    });

  } catch (error: any) {
    console.error('Fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix Hugging Face validation',
      details: error.message
    });
  }
}
