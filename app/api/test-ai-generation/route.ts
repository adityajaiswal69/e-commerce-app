import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🧪 Testing AI generation system...');
    
    // Get available models
    const { data: models, error } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (*)
      `)
      .eq('is_enabled', true)
      .eq('ai_providers.is_active', true);

    if (error || !models || models.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No enabled AI models found',
        details: error?.message || 'No models available'
      });
    }

    // Find a working Stability AI model
    const stabilityModel = models.find(m => 
      m.ai_providers.provider_key === 'stability' && 
      m.ai_providers.api_token
    );

    if (!stabilityModel) {
      return NextResponse.json({
        success: false,
        error: 'No working Stability AI model found',
        available_models: models.map(m => ({
          name: m.display_name,
          provider: m.ai_providers.name,
          has_token: !!m.ai_providers.api_token
        }))
      });
    }

    console.log(`Found working model: ${stabilityModel.display_name}`);

    // Test generation with a simple prompt
    const testPrompt = 'a beautiful sunset over mountains';
    
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/ai-art/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: testPrompt,
          model_id: stabilityModel.id,
          width: 1024,
          height: 1024,
          num_inference_steps: 20,
          guidance_scale: 7.5
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return NextResponse.json({
          success: true,
          message: 'AI generation is working!',
          test_result: {
            prompt: testPrompt,
            model_used: stabilityModel.display_name,
            provider: stabilityModel.ai_providers.name,
            image_url: result.imageUrl,
            generation_time: 'Success'
          },
          system_status: {
            models_available: models.length,
            stability_ai: 'Working',
            api_configured: true
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Generation failed',
          details: result.error || 'Unknown error',
          test_result: {
            prompt: testPrompt,
            model_used: stabilityModel.display_name,
            provider: stabilityModel.ai_providers.name,
            error: result.error
          }
        });
      }

    } catch (genError: any) {
      return NextResponse.json({
        success: false,
        error: 'Generation request failed',
        details: genError.message,
        test_result: {
          prompt: testPrompt,
          model_used: stabilityModel.display_name,
          provider: stabilityModel.ai_providers.name,
          error: genError.message
        }
      });
    }

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, quick_test } = await request.json();
    
    if (quick_test) {
      return NextResponse.json({
        success: true,
        message: 'Quick test - API is responding',
        timestamp: new Date().toISOString(),
        prompt_received: prompt || 'No prompt provided'
      });
    }

    // Run full test with provided prompt
    const testPrompt = prompt || 'a serene landscape with trees and water';
    
    const response = await fetch(`${request.nextUrl.origin}/api/test-ai-generation`, {
      method: 'GET'
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      ...result,
      custom_prompt: testPrompt
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'POST test failed',
      details: error.message
    });
  }
}
