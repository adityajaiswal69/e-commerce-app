import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all providers with their models
    const { data: providers, error: fetchError } = await supabase
      .from('ai_providers')
      .select(`
        *,
        ai_models (
          id,
          model_id,
          display_name,
          is_enabled
        )
      `);

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch providers', details: fetchError });
    }

    if (!providers) {
      return NextResponse.json({ error: 'No providers found' });
    }

    const results = [];

    for (const provider of providers) {
      const result = {
        provider_key: provider.provider_key,
        name: provider.name,
        base_url: provider.base_url,
        has_api_token: !!provider.api_token,
        is_active: provider.is_active,
        models_count: provider.ai_models?.length || 0,
        enabled_models: provider.ai_models?.filter((m: any) => m.is_enabled).length || 0,
        issues: [] as string[],
        status: 'unknown'
      };

      // Check configuration issues
      switch (provider.provider_key) {
        case 'openai':
          if (provider.base_url !== 'https://api.openai.com/v1') {
            result.issues.push(`Incorrect base URL: ${provider.base_url}, should be: https://api.openai.com/v1`);
          }
          if (!provider.api_token) {
            result.issues.push('Missing API token');
          } else if (!provider.api_token.startsWith('sk-')) {
            result.issues.push('API token should start with "sk-"');
          }
          break;

        case 'huggingface':
          if (provider.base_url !== 'https://api-inference.huggingface.co/models') {
            result.issues.push(`Incorrect base URL: ${provider.base_url}, should be: https://api-inference.huggingface.co/models`);
          }
          if (!provider.api_token) {
            result.issues.push('Missing API token');
          } else if (!provider.api_token.startsWith('hf_')) {
            result.issues.push('API token should start with "hf_"');
          }
          break;

        case 'replicate':
          if (provider.base_url !== 'https://api.replicate.com/v1') {
            result.issues.push(`Incorrect base URL: ${provider.base_url}, should be: https://api.replicate.com/v1`);
          }
          if (!provider.api_token) {
            result.issues.push('Missing API token');
          } else if (!provider.api_token.startsWith('r8_')) {
            result.issues.push('API token should start with "r8_"');
          }
          break;

        case 'modelabs':
          if (provider.base_url !== 'https://modelslab.com/api/v6') {
            result.issues.push(`Incorrect base URL: ${provider.base_url}, should be: https://modelslab.com/api/v6`);
          }
          if (!provider.api_token) {
            result.issues.push('Missing API token');
          }
          break;

        case 'stability':
          if (provider.base_url !== 'https://api.stability.ai/v1') {
            result.issues.push(`Incorrect base URL: ${provider.base_url}, should be: https://api.stability.ai/v1`);
          }
          if (!provider.api_token) {
            result.issues.push('Missing API token');
          } else if (!provider.api_token.startsWith('sk-')) {
            result.issues.push('API token should start with "sk-"');
          }
          break;
      }

      // Determine status
      if (result.issues.length === 0 && result.has_api_token && result.is_active && result.enabled_models > 0) {
        result.status = 'ready';
      } else if (result.issues.length > 0) {
        result.status = 'configuration_error';
      } else if (!result.has_api_token) {
        result.status = 'missing_token';
      } else if (!result.is_active) {
        result.status = 'inactive';
      } else if (result.enabled_models === 0) {
        result.status = 'no_enabled_models';
      } else {
        result.status = 'unknown';
      }

      results.push(result);
    }

    const summary = {
      total_providers: results.length,
      ready_providers: results.filter(r => r.status === 'ready').length,
      providers_with_issues: results.filter(r => r.issues.length > 0).length,
      providers_missing_tokens: results.filter(r => r.status === 'missing_token').length
    };

    return NextResponse.json({
      success: true,
      summary,
      providers: results,
      recommendations: generateRecommendations(results)
    });

  } catch (error) {
    console.error('Error testing providers:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateRecommendations(results: any[]): string[] {
  const recommendations = [];

  const readyProviders = results.filter(r => r.status === 'ready');
  if (readyProviders.length === 0) {
    recommendations.push('⚠️ No providers are ready for use. Configure at least one provider with a valid API token.');
  }

  const missingTokens = results.filter(r => r.status === 'missing_token');
  if (missingTokens.length > 0) {
    recommendations.push(`🔑 Add API tokens for: ${missingTokens.map(p => p.name).join(', ')}`);
  }

  const configErrors = results.filter(r => r.status === 'configuration_error');
  if (configErrors.length > 0) {
    recommendations.push(`🔧 Fix configuration issues for: ${configErrors.map(p => p.name).join(', ')}`);
  }

  const inactiveProviders = results.filter(r => r.status === 'inactive');
  if (inactiveProviders.length > 0) {
    recommendations.push(`▶️ Activate providers: ${inactiveProviders.map(p => p.name).join(', ')}`);
  }

  if (readyProviders.length > 0) {
    recommendations.push(`✅ Ready to use: ${readyProviders.map(p => p.name).join(', ')}`);
  }

  return recommendations;
}
