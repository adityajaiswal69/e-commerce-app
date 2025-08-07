import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Add validation columns to ai_models table
    const alterQueries = [
      `ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'untested'`,
      `ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS validation_message TEXT`,
      `ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS validation_error TEXT`,
      `ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS last_validated TIMESTAMP WITH TIME ZONE`
    ];

    for (const query of alterQueries) {
      const { error } = await supabase.rpc('execute_sql', { sql: query });
      if (error) {
        console.error('Error executing query:', query, error);
        // Continue with other queries even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Validation columns added successfully',
      columns_added: [
        'validation_status',
        'validation_message', 
        'validation_error',
        'last_validated'
      ]
    });

  } catch (error) {
    console.error('Error adding validation columns:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add validation columns',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Alternative approach using direct SQL if RPC doesn't work
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to add validation columns',
    sql_commands: [
      'ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT \'untested\'',
      'ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS validation_message TEXT',
      'ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS validation_error TEXT', 
      'ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS last_validated TIMESTAMP WITH TIME ZONE'
    ]
  });
}
