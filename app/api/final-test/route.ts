import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all models with their providers
    const { data: models, error } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (
          id,
          provider_key,
          name,
          base_url,
          api_token,
          is_active
        )
      `)
      .eq('is_enabled', true);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch models', details: error });
    }

    const results = {
      totalModels: models?.length || 0,
      workingModels: [],
      brokenModels: [],
      summary: {
        stabilityAI: 0,
        huggingFace: 0,
        openAI: 0,
        replicate: 0
      }
    };

    for (const model of models || []) {
      const provider = model.ai_providers;
      const modelInfo = {
        id: model.id,
        display_name: model.display_name,
        model_id: model.model_id,
        provider: provider.name,
        provider_key: provider.provider_key,
        has_api_token: !!provider.api_token,
        is_provider_active: provider.is_active,
        status: 'unknown'
      };

      // Check if model is likely to work
      let isWorking = false;
      let issues = [];

      if (!provider.api_token) {
        issues.push('No API token');
      }

      if (!provider.is_active) {
        issues.push('Provider inactive');
      }

      switch (provider.provider_key) {
        case 'stability':
          if (model.model_id === 'stable-diffusion-xl-1024-v1-0' || 
              model.model_id === 'stable-diffusion-xl-1024-v0-9') {
            isWorking = true;
            results.summary.stabilityAI++;
          } else {
            issues.push('Invalid Stability AI model ID');
          }
          break;

        case 'huggingface':
          if (model.model_id.includes('/')) {
            isWorking = true;
            results.summary.huggingFace++;
          } else {
            issues.push('Invalid Hugging Face model format');
          }
          break;

        case 'openai':
          if (model.model_id === 'dall-e-2' || model.model_id === 'dall-e-3') {
            // OpenAI models might work but often have billing issues
            isWorking = false; // Mark as broken due to common billing issues
            issues.push('OpenAI billing/permission issues common');
            results.summary.openAI++;
          } else {
            issues.push('Invalid OpenAI model ID');
          }
          break;

        case 'replicate':
          isWorking = true; // Assume working if properly configured
          results.summary.replicate++;
          break;
      }

      modelInfo.status = isWorking && issues.length === 0 ? 'working' : 'broken';
      modelInfo.issues = issues;

      if (modelInfo.status === 'working') {
        results.workingModels.push(modelInfo);
      } else {
        results.brokenModels.push(modelInfo);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${results.totalModels} enabled models`,
      results,
      recommendations: [
        `✅ ${results.workingModels.length} models ready to use`,
        `⚠️ ${results.brokenModels.length} models have issues`,
        results.summary.stabilityAI > 0 ? '🟢 Stability AI SDXL models available' : '🔴 No Stability AI models',
        results.summary.huggingFace > 0 ? '🟡 Hugging Face models available' : '⚪ No Hugging Face models',
        results.summary.openAI > 0 ? '🔴 OpenAI models present but likely have billing issues' : '⚪ No OpenAI models',
        results.summary.replicate > 0 ? '🟣 Replicate models available' : '⚪ No Replicate models'
      ]
    });

  } catch (error) {
    console.error('Error in final test:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
