import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    const results = {
      orders: { exists: false, error: null },
      order_items: { exists: false, error: null },
      payment_transactions: { exists: false, error: null },
      payment_settings: { exists: false, error: null },
      products: { exists: false, error: null },
    };

    // Check orders table
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .limit(1);
      
      if (!error) {
        results.orders.exists = true;
      } else {
        results.orders.error = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        };
      }
    } catch (err) {
      results.orders.error = { message: 'Unexpected error', details: String(err) };
    }

    // Check order_items table
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('id')
        .limit(1);
      
      if (!error) {
        results.order_items.exists = true;
      } else {
        results.order_items.error = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        };
      }
    } catch (err) {
      results.order_items.error = { message: 'Unexpected error', details: String(err) };
    }

    // Check payment_transactions table
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('id')
        .limit(1);
      
      if (!error) {
        results.payment_transactions.exists = true;
      } else {
        results.payment_transactions.error = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        };
      }
    } catch (err) {
      results.payment_transactions.error = { message: 'Unexpected error', details: String(err) };
    }

    // Check payment_settings table
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('id')
        .limit(1);
      
      if (!error) {
        results.payment_settings.exists = true;
      } else {
        results.payment_settings.error = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        };
      }
    } catch (err) {
      results.payment_settings.error = { message: 'Unexpected error', details: String(err) };
    }

    // Check products table (should exist)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (!error) {
        results.products.exists = true;
      } else {
        results.products.error = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        };
      }
    } catch (err) {
      results.products.error = { message: 'Unexpected error', details: String(err) };
    }

    const allTablesExist = results.orders.exists && results.order_items.exists && 
                          results.payment_transactions.exists && results.payment_settings.exists;

    return NextResponse.json({
      success: true,
      tables: results,
      allTablesExist,
      message: allTablesExist 
        ? 'All payment system tables are available'
        : 'Some payment system tables are missing. Please run the database setup script.',
      setupInstructions: !allTablesExist ? {
        step1: 'Open your Supabase Dashboard',
        step2: 'Go to SQL Editor',
        step3: 'Copy and paste the contents of scripts/simple-payment-setup.sql',
        step4: 'Click Run to execute the script',
        step5: 'Refresh this page to verify setup'
      } : null
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
