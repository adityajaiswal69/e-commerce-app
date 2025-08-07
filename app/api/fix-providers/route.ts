import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all providers
    const { data: providers, error: fetchError } = await supabase
      .from('ai_providers')
      .select('*');

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch providers', details: fetchError });
    }

    if (!providers) {
      return NextResponse.json({ error: 'No providers found' });
    }

    const updates = [];

    // Fix each provider's configuration
    for (const provider of providers) {
      let updateData: any = {};
      let needsUpdate = false;

      switch (provider.provider_key) {
        case 'openai':
          if (provider.base_url !== 'https://api.openai.com/v1') {
            updateData.base_url = 'https://api.openai.com/v1';
            needsUpdate = true;
          }
          if (provider.name !== 'OpenAI') {
            updateData.name = 'OpenAI';
            needsUpdate = true;
          }
          break;

        case 'huggingface':
          if (provider.base_url !== 'https://api-inference.huggingface.co/models') {
            updateData.base_url = 'https://api-inference.huggingface.co/models';
            needsUpdate = true;
          }
          if (provider.name !== 'Hugging Face') {
            updateData.name = 'Hugging Face';
            needsUpdate = true;
          }
          break;

        case 'replicate':
          if (provider.base_url !== 'https://api.replicate.com/v1') {
            updateData.base_url = 'https://api.replicate.com/v1';
            needsUpdate = true;
          }
          if (provider.name !== 'Replicate') {
            updateData.name = 'Replicate';
            needsUpdate = true;
          }
          break;

        case 'stability':
          if (provider.base_url !== 'https://api.stability.ai/v1') {
            updateData.base_url = 'https://api.stability.ai/v1';
            needsUpdate = true;
          }
          if (provider.name !== 'Stability AI') {
            updateData.name = 'Stability AI';
            needsUpdate = true;
          }
          break;
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('ai_providers')
          .update(updateData)
          .eq('id', provider.id);

        if (updateError) {
          console.error(`Failed to update provider ${provider.provider_key}:`, updateError);
        } else {
          updates.push({
            provider: provider.provider_key,
            changes: updateData
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Provider configurations updated',
      updates: updates,
      totalProviders: providers.length
    });

  } catch (error) {
    console.error('Error fixing providers:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
