import { createClientComponentClient } from '@/lib/supabase/client';
import { AIArt } from '@/types/database.types';

export interface AIArtGenerationParams {
  model_id: string;
  prompt: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  negative_prompt?: string;
}

export interface AIArtGenerationResult {
  imageUrl: string;
  svgUrl?: string;
  originalImageUrl?: string;
  generationParams: AIArtGenerationParams;
}

/**
 * Generate AI art using Stable Diffusion via Replicate API
 */
export async function generateAIArt(params: AIArtGenerationParams): Promise<AIArt> {
  try {
    const response = await fetch('/api/ai-art/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate AI art';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('AI Art Generation Error:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage
      });
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error generating AI art:', error);
    throw error;
  }
}

/**
 * Save AI art to database
 */
export async function saveAIArt(
  prompt: string,
  imageUrl: string,
  generationParams: AIArtGenerationParams,
  svgUrl?: string,
  originalImageUrl?: string
): Promise<AIArt> {
  try {
    const supabase = createClientComponentClient();
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('ai_art')
      .insert({
        user_id: session.user.id,
        prompt,
        image_url: imageUrl,
        svg_url: svgUrl,
        original_image_url: originalImageUrl,
        generation_params: generationParams,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving AI art:', error);
    throw error;
  }
}

/**
 * Get user's AI art history
 */
export async function getUserAIArt(limit = 20): Promise<AIArt[]> {
  try {
    const response = await fetch(`/api/ai-art/history?limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch AI art history');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching AI art:', error);
    throw error;
  }
}

/**
 * Delete AI art
 */
export async function deleteAIArt(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/ai-art/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete AI art');
    }
  } catch (error) {
    console.error('Error deleting AI art:', error);
    throw error;
  }
}

/**
 * Convert image to SVG using potrace (server-side)
 */
export async function convertImageToSVG(imageUrl: string): Promise<string> {
  try {
    const response = await fetch('/api/ai-art/convert-to-svg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to convert image to SVG');
    }

    const result = await response.json();
    return result.svgUrl;
  } catch (error) {
    console.error('Error converting image to SVG:', error);
    throw error;
  }
}

/**
 * Upload AI art image to Supabase storage
 */
export async function uploadAIArtImage(
  imageBlob: Blob,
  fileName: string,
  userId: string
): Promise<string> {
  try {
    const supabase = createClientComponentClient();
    
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('ai-art-images')
      .upload(filePath, imageBlob, {
        contentType: imageBlob.type,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('ai-art-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading AI art image:', error);
    throw error;
  }
}
