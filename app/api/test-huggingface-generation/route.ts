import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🎨 Testing Hugging Face image generation...');
    
    // Get a working Hugging Face model
    const { data: models, error } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (*)
      `)
      .eq('ai_providers.provider_key', 'huggingface')
      .eq('is_enabled', true)
      .limit(1);

    if (error || !models || models.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No Hugging Face models found',
        details: error?.message
      });
    }

    const model = models[0];
    const provider = model.ai_providers;

    if (!provider.api_token) {
      return NextResponse.json({
        success: false,
        error: 'No API token configured for Hugging Face'
      });
    }

    console.log(`Testing generation with model: ${model.display_name}`);

    // Test image generation using the AI art generation API
    const testPrompt = 'a serene mountain landscape with a lake';
    
    try {
      const generationResponse = await fetch(`${request.nextUrl.origin}/api/ai-art/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: testPrompt,
          model_id: model.id,
          width: 512,
          height: 512,
          num_inference_steps: 15,
          guidance_scale: 7.5
        })
      });

      const generationResult = await generationResponse.json();

      if (generationResponse.ok && generationResult.success) {
        console.log('✅ Image generation successful!');
        
        return NextResponse.json({
          success: true,
          message: 'Hugging Face image generation is working!',
          test_details: {
            model_used: model.display_name,
            model_id: model.model_id,
            provider: provider.name,
            prompt: testPrompt,
            image_url: generationResult.imageUrl,
            generation_successful: true
          },
          provider_info: {
            base_url: provider.base_url,
            has_api_token: true,
            is_active: provider.is_active
          },
          next_steps: [
            '🎉 Hugging Face integration is fully working!',
            'You can now generate images using Hugging Face models',
            'Go to the design page and try it out',
            'The validation system should now show "Working" status'
          ]
        });

      } else {
        console.log('❌ Image generation failed');
        
        return NextResponse.json({
          success: false,
          error: 'Image generation failed',
          details: generationResult.error || 'Unknown error',
          test_details: {
            model_used: model.display_name,
            model_id: model.model_id,
            provider: provider.name,
            prompt: testPrompt,
            generation_successful: false,
            error_details: generationResult.error
          },
          troubleshooting: [
            'Check if your Hugging Face API token is valid',
            'Verify the token has proper permissions',
            'Try testing the model validation first',
            'Check the server logs for more details'
          ]
        });
      }

    } catch (genError: any) {
      console.log(`💥 Generation test error: ${genError.message}`);
      
      return NextResponse.json({
        success: false,
        error: 'Generation test failed',
        details: genError.message,
        test_details: {
          model_used: model.display_name,
          model_id: model.model_id,
          provider: provider.name,
          prompt: testPrompt,
          generation_successful: false
        }
      });
    }

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test setup failed',
      details: error.message
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    const customPrompt = prompt || 'a beautiful sunset over mountains';
    
    // Run the same test but with custom prompt
    const testUrl = new URL('/api/test-huggingface-generation', request.nextUrl.origin);
    const response = await fetch(testUrl.toString());
    const result = await response.json();
    
    // Update the prompt in the result
    if (result.test_details) {
      result.test_details.prompt = customPrompt;
      result.custom_prompt_used = true;
    }
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Custom test failed',
      details: error.message
    });
  }
}
