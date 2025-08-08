import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      model_id,
      prompt,
      width = 512,
      height = 512,
      num_inference_steps = 20,
      guidance_scale = 7.5,
      negative_prompt = "blurry, low quality, distorted"
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!model_id) {
      return NextResponse.json(
        { error: 'Model selection is required' },
        { status: 400 }
      );
    }

    // Get model configuration
    console.log('Fetching model with ID:', model_id);
    const { data: model, error: modelError } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (*)
      `)
      .eq('id', model_id)
      .eq('is_enabled', true)
      .single();

    if (modelError) {
      console.error('Model fetch error:', modelError);
      return NextResponse.json(
        { error: `Database error: ${modelError.message}` },
        { status: 500 }
      );
    }

    if (!model) {
      console.error('Model not found:', model_id);
      return NextResponse.json(
        { error: 'Model not found or not enabled' },
        { status: 404 }
      );
    }

    if (!model.ai_providers) {
      console.error('Provider not found for model:', model);
      return NextResponse.json(
        { error: 'AI provider not found for this model' },
        { status: 400 }
      );
    }

    if (!model.ai_providers.is_active) {
      console.error('Provider not active:', model.ai_providers);
      return NextResponse.json(
        { error: 'AI provider is not active' },
        { status: 400 }
      );
    }

    console.log('Using model:', model.display_name, 'with provider:', model.ai_providers.name);

    // Use the selected model for generation
    const imageUrl = await generateWithSelectedModel(model, prompt, {
      width,
      height,
      num_inference_steps,
      guidance_scale,
      negative_prompt
    }, session.user.id);

    const generationParams = {
      model_id,
      model_name: model.display_name,
      provider: model.ai_providers.name,
      prompt,
      width,
      height,
      num_inference_steps,
      guidance_scale,
      negative_prompt
    };

    // Save to database
    const { data: aiArt, error: dbError } = await supabase
      .from('ai_art')
      .insert({
        user_id: session.user.id,
        prompt,
        image_url: imageUrl,
        generation_params: generationParams,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save AI art' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: aiArt,
      imageUrl: imageUrl,
      generationParams
    });

  } catch (error) {
    console.error('Error generating AI art:', error);

    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Generate AI art with selected model using the configured AI provider
 */
async function generateWithSelectedModel(model: any, prompt: string, params: any, userId: string): Promise<string> {
  const provider = model.ai_providers;

  // Check if provider has API token
  if (!provider.api_token) {
    throw new Error(`API token not configured for provider: ${provider.name}`);
  }

  console.log(`Generating with provider: ${provider.name} (${provider.provider_key})`);

  try {
    // Generate based on provider type - all providers are equally supported
    switch (provider.provider_key) {
      case 'huggingface':
        return await generateWithHuggingFace(model, prompt, params, userId);
      case 'openai':
        return await generateWithOpenAI(model, prompt, params, userId);
      case 'replicate':
        return await generateWithReplicate(model, prompt, params, userId);
      case 'stability':
        return await generateWithStability(model, prompt, params, userId);
      case 'modelabs':
        return await generateWithModelabs(model, prompt, params, userId);
      default:
        throw new Error(`Unsupported provider: ${provider.provider_key}`);
    }
  } catch (error: any) {
    // Provide user-friendly error messages
    if (error.message.includes('timeout') || error.message.includes('overloaded') || error.message.includes('524')) {
      throw new Error(`${provider.name} servers are currently busy. Please try again in a few minutes.`);
    } else if (error.message.includes('401') || error.message.includes('Invalid')) {
      throw new Error(`API configuration issue with ${provider.name}. Please check your settings.`);
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      throw new Error(`Rate limit reached for ${provider.name}. Please wait a moment before trying again.`);
    } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      throw new Error(`${provider.name} is experiencing technical difficulties. Please try again later.`);
    }

    // Re-throw the original error if it's already user-friendly
    throw error;
  }
}

/**
 * Generate with Hugging Face Inference API
 */
async function generateWithHuggingFace(model: any, prompt: string, params: any, userId: string): Promise<string> {
  const provider = model.ai_providers;
  const apiUrl = `${provider.base_url}/${model.model_id}`;

  try {
    console.log(`Generating with Hugging Face: ${model.model_id}`);
    console.log(`API URL: ${apiUrl}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`API Token present: ${!!provider.api_token}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: params.width || model.model_settings?.width || 512,
          height: params.height || model.model_settings?.height || 512,
          num_inference_steps: params.num_inference_steps || model.model_settings?.num_inference_steps || 20,
          guidance_scale: params.guidance_scale || model.model_settings?.guidance_scale || 7.5,
          negative_prompt: params.negative_prompt || "blurry, low quality, distorted",
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);

      if (response.status === 503) {
        throw new Error('Model is currently loading. Please try again in a few moments.');
      } else if (response.status === 401) {
        throw new Error('Invalid API token. Please check your Hugging Face configuration.');
      } else {
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
      }
    }

    // Get the image blob
    const imageBlob = await response.blob();

    if (imageBlob.size === 0) {
      throw new Error('Received empty image from Hugging Face API');
    }

    // Upload to Supabase storage
    const fileName = `${uuidv4()}.png`;
    const supabase = await createServerSupabaseClient();
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ai-art-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to save generated image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('ai-art-images')
      .getPublicUrl(filePath);

    console.log('Successfully generated and uploaded image:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('Error in generateWithHuggingFace:', error);
    throw error;
  }
}

/**
 * Generate with OpenAI DALL-E
 */
async function generateWithOpenAI(model: any, prompt: string, params: any, userId: string): Promise<string> {
  const provider = model.ai_providers;

  try {
    console.log(`Generating with OpenAI: ${model.model_id}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`API Token present: ${!!provider.api_token}`);
    console.log(`Base URL: ${provider.base_url}`);

    const response = await fetch(`${provider.base_url}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model_id,
        prompt: prompt,
        n: 1,
        size: `${params.width || 1024}x${params.height || 1024}`,
        quality: params.quality || 'standard',
        response_format: 'url'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);

      if (response.status === 401) {
        throw new Error('Invalid OpenAI API token. Please check your configuration.');
      } else {
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }
    }

    const result = await response.json();
    const imageUrl = result.data[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI API');
    }

    // Download and upload to Supabase storage
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    const fileName = `${uuidv4()}.png`;
    const supabase = await createServerSupabaseClient();
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ai-art-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to save generated image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('ai-art-images')
      .getPublicUrl(filePath);

    console.log('Successfully generated and uploaded OpenAI image:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('Error in generateWithOpenAI:', error);
    throw error;
  }
}

/**
 * Generate with Replicate
 */
async function generateWithReplicate(model: any, prompt: string, params: any, userId: string): Promise<string> {
  const provider = model.ai_providers;

  try {
    console.log(`Generating with Replicate: ${model.model_id}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`API Token present: ${!!provider.api_token}`);

    // Create prediction
    const response = await fetch(`${provider.base_url}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${provider.api_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model.model_id,
        input: {
          prompt: prompt,
          width: params.width || model.model_settings?.width || 512,
          height: params.height || model.model_settings?.height || 512,
          num_inference_steps: params.num_inference_steps || model.model_settings?.num_inference_steps || 20,
          guidance_scale: params.guidance_scale || model.model_settings?.guidance_scale || 7.5,
          negative_prompt: params.negative_prompt || "blurry, low quality, distorted",
          scheduler: "K_EULER"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', response.status, errorText);

      if (response.status === 401) {
        throw new Error('Invalid Replicate API token. Please check your configuration.');
      } else {
        throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
      }
    }

    const prediction = await response.json();

    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pollResponse = await fetch(`${provider.base_url}/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${provider.api_token}`,
        },
      });

      result = await pollResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error(`Replicate generation failed: ${result.error}`);
    }

    const imageUrl = result.output?.[0];
    if (!imageUrl) {
      throw new Error('No image URL received from Replicate API');
    }

    // Download and upload to Supabase storage
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    const fileName = `${uuidv4()}.png`;
    const supabase = await createServerSupabaseClient();
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ai-art-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to save generated image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('ai-art-images')
      .getPublicUrl(filePath);

    console.log('Successfully generated and uploaded Replicate image:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('Error in generateWithReplicate:', error);
    throw error;
  }
}

/**
 * Generate with Stability AI
 */
async function generateWithStability(model: any, prompt: string, params: any, userId: string): Promise<string> {
  const provider = model.ai_providers;

  try {
    console.log(`Generating with Stability AI: ${model.model_id}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Received params:`, params);

    // Handle dimensions for SDXL models - force 1024x1024 for all Stability AI models
    let width = 1024;
    let height = 1024;

    // For non-SDXL models, allow smaller dimensions
    if (!model.model_id.includes('xl') && !model.model_id.includes('1024')) {
      width = params.width || model.model_settings?.width || 512;
      height = params.height || model.model_settings?.height || 512;
    }

    console.log(`Using dimensions: ${width}x${height} for model: ${model.model_id}`);

    // Add timeout and retry logic for better reliability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    let response;
    try {
      response = await fetch(`${provider.base_url}/generation/${model.model_id}/text-to-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.api_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1
            },
            {
              text: params.negative_prompt || "blurry, low quality, distorted",
              weight: -1
            }
          ],
          cfg_scale: params.guidance_scale || model.model_settings?.cfg_scale || 7.5,
          height: height,
          width: width,
          steps: params.num_inference_steps || model.model_settings?.steps || 30,
          samples: 1,
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Stability AI servers may be overloaded. Please try again in a few minutes.');
      }
      throw error;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability AI API error:', response.status, errorText);

      if (response.status === 401) {
        throw new Error('Invalid Stability AI API token. Please check your configuration.');
      } else if (response.status === 404) {
        throw new Error(`Stability AI model "${model.model_id}" not found. This model may no longer be available.`);
      } else if (response.status === 524) {
        throw new Error('Stability AI servers are currently overloaded. Please try again in a few minutes.');
      } else if (response.status >= 500) {
        throw new Error('Stability AI servers are experiencing issues. Please try again later.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      } else {
        throw new Error(`Stability AI API error: ${response.status} - Please try again later.`);
      }
    }

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      const responseText = await response.text();
      console.error('Failed to parse Stability AI response as JSON:', responseText);
      throw new Error('Stability AI returned invalid response format. Please try again.');
    }

    const imageData = result.artifacts?.[0]?.base64;

    if (!imageData) {
      throw new Error('No image data received from Stability AI API');
    }

    // Convert base64 to blob
    const imageBlob = new Blob([Buffer.from(imageData, 'base64')], { type: 'image/png' });

    const fileName = `${uuidv4()}.png`;
    const supabase = await createServerSupabaseClient();
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ai-art-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to save generated image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('ai-art-images')
      .getPublicUrl(filePath);

    console.log('Successfully generated and uploaded Stability AI image:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('Error in generateWithStability:', error);
    throw error;
  }
}

/**
 * Generate with Modelabs API
 */
async function generateWithModelabs(model: any, prompt: string, params: any, userId: string): Promise<string> {
  const provider = model.ai_providers;
  const apiUrl = `${provider.base_url}/images/text2img`;

  try {
    console.log(`Generating with Modelabs: ${model.model_id}`);
    console.log(`API URL: ${apiUrl}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`API Token present: ${!!provider.api_token}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: provider.api_token,
        model_id: model.model_id,
        prompt: prompt,
        negative_prompt: params.negative_prompt || "blurry, low quality, distorted, deformed",
        width: (params.width || model.model_settings?.width || 512).toString(),
        height: (params.height || model.model_settings?.height || 512).toString(),
        samples: "1",
        num_inference_steps: (params.num_inference_steps || model.model_settings?.num_inference_steps || 30).toString(),
        safety_checker: model.model_settings?.safety_checker || "no",
        enhance_prompt: model.model_settings?.enhance_prompt || "yes",
        guidance_scale: params.guidance_scale || model.model_settings?.guidance_scale || 7.5,
        scheduler: model.model_settings?.scheduler || "UniPCMultistepScheduler",
        tomesd: "yes",
        use_karras_sigmas: "yes",
        clip_skip: "2"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Modelabs API error:', response.status, errorText);

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API token. Please check your Modelabs configuration.');
      } else if (response.status === 402) {
        throw new Error('Insufficient credits. Please check your Modelabs account balance.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      } else if (response.status === 404) {
        throw new Error(`Model "${model.model_id}" not found on Modelabs.`);
      } else {
        throw new Error(`Modelabs API error: ${response.status} - ${errorText}`);
      }
    }

    const result = await response.json();

    // Modelabs returns different response formats, handle both
    let imageUrl = null;
    if (result.output && Array.isArray(result.output) && result.output.length > 0) {
      imageUrl = result.output[0];
    } else if (result.image_url) {
      imageUrl = result.image_url;
    } else if (result.images && Array.isArray(result.images) && result.images.length > 0) {
      imageUrl = result.images[0];
    }

    if (!imageUrl) {
      console.error('No image URL in Modelabs response:', result);
      throw new Error('No image URL received from Modelabs API');
    }

    console.log('Successfully generated Modelabs image:', imageUrl);
    return imageUrl;

  } catch (error) {
    console.error('Error in generateWithModelabs:', error);
    throw error;
  }
}



// TODO: Replace with actual Stable Diffusion integration
/*
async function generateWithStableDiffusion(params: AIArtGenerationParams): Promise<string> {
  // Example integration with Replicate API
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
      input: {
        prompt: params.prompt,
        width: params.width,
        height: params.height,
        num_inference_steps: params.num_inference_steps,
        guidance_scale: params.guidance_scale,
        negative_prompt: params.negative_prompt,
      }
    }),
  });

  const prediction = await response.json();
  
  // Poll for completion
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'AI generation failed');
  }

  return result.output[0]; // URL of generated image
}
*/
