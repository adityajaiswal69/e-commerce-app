export interface BackgroundRemovalResult {
  success: boolean;
  processedImageUrl?: string;
  logId?: string;
  message?: string;
  error?: string;
}

export interface BackgroundRemovedImage {
  id: string;
  new_url: string;
  image_name: string;
  tags: string[];
  category: string;
  file_size: number;
  dimensions: string;
  usage_count: number;
  removed_at: string;
  user_id: string;
}

export async function removeBackground(
  imageUrl: string, 
  makePublic: boolean = false,
  imageName: string = '',
  tags: string[] = []
): Promise<BackgroundRemovalResult> {
  try {
    // Validate image URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      return {
        success: false,
        error: 'Invalid image URL provided',
      };
    }

    // Check if URL is accessible
    try {
      const url = new URL(imageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return {
          success: false,
          error: 'Invalid image URL protocol',
        };
      }
    } catch {
      return {
        success: false,
        error: 'Invalid image URL format',
      };
    }

    const response = await fetch('/api/background-remover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        imageUrl, 
        makePublic, 
        imageName, 
        tags
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to remove background',
      };
    }

    return {
      success: true,
      processedImageUrl: data.processedImageUrl,
      logId: data.logId,
      message: data.message,
    };
  } catch (error) {
    console.error('Background removal error:', error);
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

// Fetch background-removed images for use in canvas
export async function fetchBackgroundRemovedImages(
  search: string = '',
  limit: number = 20,
  offset: number = 0
): Promise<{ success: boolean; images?: BackgroundRemovedImage[]; total?: number; hasMore?: boolean; error?: string }> {
  try {
    const params = new URLSearchParams({
      search,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`/api/background-removed-images?${params}`);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch images',
      };
    }

    return {
      success: true,
      images: data.images,
      total: data.total,
      hasMore: data.hasMore,
    };
  } catch (error) {
    console.error('Error fetching background-removed images:', error);
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

// Increment usage count when an image is used
export async function incrementImageUsage(imageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/background-removed-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update usage count',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error incrementing usage count:', error);
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

// Helper function to determine bucket from URL patterns
export function getBucketFromUrl(url: string): string {
  if (url.includes('design-images') || url.includes('designs')) {
    return 'designs';
  } else if (url.includes('blog-images')) {
    return 'blog-images';
  } else if (url.includes('product-images')) {
    return 'product-images';
  } else if (url.includes('ai-art-images')) {
    return 'ai-art-images';
  } else if (url.includes('art-assets')) {
    return 'art-assets';
  } else if (url.includes('background-removed-images')) {
    return 'background-removed-images';
  }
  
  // Default to designs bucket
  return 'designs';
} 