import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function checkPaymentSystemTables() {
  const supabase = await createServerSupabaseClient();
  
  const results = {
    orders: false,
    order_items: false,
    payment_transactions: false,
    payment_settings: false,
    errors: [] as string[]
  };

  try {
    // Check orders table
    const { error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (!ordersError) {
      results.orders = true;
    } else {
      results.errors.push(`Orders table: ${ordersError.message}`);
    }

    // Check order_items table
    const { error: itemsError } = await supabase
      .from('order_items')
      .select('id')
      .limit(1);
    
    if (!itemsError) {
      results.order_items = true;
    } else {
      results.errors.push(`Order items table: ${itemsError.message}`);
    }

    // Check payment_transactions table
    const { error: transactionsError } = await supabase
      .from('payment_transactions')
      .select('id')
      .limit(1);
    
    if (!transactionsError) {
      results.payment_transactions = true;
    } else {
      results.errors.push(`Payment transactions table: ${transactionsError.message}`);
    }

    // Check payment_settings table
    const { error: settingsError } = await supabase
      .from('payment_settings')
      .select('id')
      .limit(1);
    
    if (!settingsError) {
      results.payment_settings = true;
    } else {
      results.errors.push(`Payment settings table: ${settingsError.message}`);
    }

  } catch (error) {
    results.errors.push(`Database connection error: ${error}`);
  }

  return results;
}

export async function createPaymentSystemTables() {
  const supabase = await createServerSupabaseClient();
  
  try {
    // This would typically be done through migrations
    // For now, we'll just check if we can create the basic structure
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Check if orders table exists
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'orders'
        );
      `
    });

    return { success: !error, error };
  } catch (error) {
    return { success: false, error };
  }
}
