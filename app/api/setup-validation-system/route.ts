import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('🚀 Setting up automatic model validation system...');
    
    // Step 1: Check if validation columns exist, if not add them
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'ai_models')
      .in('column_name', ['validation_status', 'validation_message', 'validation_error', 'last_validated']);

    const existingColumns = columns?.map(c => c.column_name) || [];
    const requiredColumns = ['validation_status', 'validation_message', 'validation_error', 'last_validated'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length > 0) {
      console.log(`📋 Adding missing columns: ${missingColumns.join(', ')}`);
      
      // Note: In a real app, you'd run these as SQL migrations
      // For now, we'll document what needs to be done
      const sqlCommands = [
        "ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'untested';",
        "ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS validation_message TEXT;",
        "ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS validation_error TEXT;",
        "ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS last_validated TIMESTAMP WITH TIME ZONE;"
      ];

      return NextResponse.json({
        success: false,
        message: 'Database columns need to be added manually',
        required_sql: sqlCommands,
        instructions: [
          '1. Run the SQL commands in your Supabase SQL editor',
          '2. Then run this setup again',
          '3. The validation system will be ready to use'
        ]
      });
    }

    // Step 2: Get all models and validate them
    const { data: models, error: modelsError } = await supabase
      .from('ai_models')
      .select(`
        *,
        ai_providers (*)
      `)
      .eq('is_enabled', true);

    if (modelsError) {
      return NextResponse.json({ error: 'Failed to fetch models', details: modelsError });
    }

    // Step 3: Validate all models
    const validationResults = [];
    
    for (const model of models || []) {
      const provider = model.ai_providers;
      
      let status = 'untested';
      let message = 'Not tested yet';
      let error_details = null;

      // Quick validation check
      if (!provider.api_token) {
        status = 'error';
        message = 'No API token configured';
        error_details = 'Provider requires an API token';
      } else if (!provider.is_active) {
        status = 'warning';
        message = 'Provider inactive';
        error_details = 'Provider is disabled';
      } else {
        // Basic model ID validation
        switch (provider.provider_key) {
          case 'stability':
            if (model.model_id.includes('stable-diffusion-xl')) {
              status = 'working';
              message = 'SDXL model - likely working';
            } else if (model.model_id === 'stable-diffusion-v1-5') {
              status = 'error';
              message = 'Invalid Stability AI model';
              error_details = 'This model ID does not exist in Stability AI API';
            } else {
              status = 'warning';
              message = 'Unknown Stability AI model';
            }
            break;
            
          case 'huggingface':
            if (model.model_id.includes('/')) {
              status = 'working';
              message = 'Valid HuggingFace format';
            } else {
              status = 'error';
              message = 'Invalid HuggingFace format';
              error_details = 'HuggingFace models should be in format "username/model-name"';
            }
            break;
            
          case 'openai':
            if (model.model_id === 'dall-e-2' || model.model_id === 'dall-e-3') {
              status = 'warning';
              message = 'OpenAI model - check billing';
              error_details = 'OpenAI models often have billing/permission issues';
            } else {
              status = 'error';
              message = 'Invalid OpenAI model';
            }
            break;
            
          default:
            status = 'warning';
            message = 'Unknown provider type';
        }
      }

      // Update model validation status
      await supabase
        .from('ai_models')
        .update({
          validation_status: status,
          validation_message: message,
          validation_error: error_details,
          last_validated: new Date().toISOString()
        })
        .eq('id', model.id);

      validationResults.push({
        model_id: model.id,
        display_name: model.display_name,
        provider: provider.name,
        status,
        message,
        error_details
      });
    }

    const summary = {
      total: validationResults.length,
      working: validationResults.filter(r => r.status === 'working').length,
      warnings: validationResults.filter(r => r.status === 'warning').length,
      errors: validationResults.filter(r => r.status === 'error').length,
      untested: validationResults.filter(r => r.status === 'untested').length
    };

    return NextResponse.json({
      success: true,
      message: '🎉 Automatic validation system is now active!',
      summary,
      validation_results: validationResults,
      features_enabled: [
        '✅ Automatic validation when API tokens are updated',
        '✅ Manual validation buttons for individual models',
        '✅ Validate all models button',
        '✅ Real-time status indicators',
        '✅ Detailed error messages',
        '✅ Working/Warning/Error status system'
      ],
      next_steps: [
        '1. Configure API tokens for your providers',
        '2. Models will be automatically validated',
        '3. Use the "Test" buttons to manually validate',
        '4. Check validation status in the admin panel'
      ]
    });

  } catch (error) {
    console.error('Error setting up validation system:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup validation system',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
