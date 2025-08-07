import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Simple in-memory storage for validation status (in production, use Redis or database)
const validationCache = new Map<string, {
  status: 'working' | 'error' | 'warning' | 'testing' | 'untested';
  message: string;
  error_details?: string;
  last_tested: string;
}>();

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all models
    const { data: models, error } = await supabase
      .from('ai_models')
      .select('id, display_name, model_id');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch models', details: error });
    }

    const modelStatuses = models?.map(model => ({
      id: model.id,
      display_name: model.display_name,
      model_id: model.model_id,
      validation: validationCache.get(model.id) || {
        status: 'untested',
        message: 'Not tested yet',
        last_tested: new Date().toISOString()
      }
    })) || [];

    return NextResponse.json({
      success: true,
      models: modelStatuses,
      cache_size: validationCache.size
    });

  } catch (error) {
    console.error('Error getting validation status:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { model_id, status, message, error_details } = await request.json();
    
    if (!model_id || !status || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: model_id, status, message'
      });
    }

    // Store validation result in cache
    validationCache.set(model_id, {
      status,
      message,
      error_details,
      last_tested: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Validation status updated',
      model_id,
      status,
      cached_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating validation status:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to get validation status for a specific model
export async function getModelValidationStatus(modelId: string) {
  return validationCache.get(modelId) || {
    status: 'untested' as const,
    message: 'Not tested yet',
    last_tested: new Date().toISOString()
  };
}

// Helper function to set validation status for a specific model
export async function setModelValidationStatus(
  modelId: string, 
  status: 'working' | 'error' | 'warning' | 'testing' | 'untested',
  message: string,
  errorDetails?: string
) {
  validationCache.set(modelId, {
    status,
    message,
    error_details: errorDetails,
    last_tested: new Date().toISOString()
  });
}
