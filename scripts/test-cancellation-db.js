// Test script to check cancellation requests database connection
// Run with: node scripts/test-cancellation-db.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabase() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test 1: Check if cancellation_requests table exists
    console.log('\n📋 Test 1: Checking cancellation_requests table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('cancellation_requests')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table check failed:', tableError);
      return;
    }
    
    console.log('✅ cancellation_requests table exists');
    console.log('📊 Total records:', tableCheck?.length || 0);

    // Test 2: Check if orders table exists and has data
    console.log('\n📋 Test 2: Checking orders table...');
    const { data: ordersCheck, error: ordersError } = await supabase
      .from('orders')
      .select('count(*)', { count: 'exact', head: true });
    
    if (ordersError) {
      console.error('❌ Orders table check failed:', ordersError);
      return;
    }
    
    console.log('✅ orders table exists');
    console.log('📊 Total orders:', ordersCheck?.length || 0);

    // Test 3: Try to fetch cancellation requests with joins
    console.log('\n📋 Test 3: Testing cancellation requests query...');
    const { data: requests, error: requestsError } = await supabase
      .from('cancellation_requests')
      .select(`
        *,
        orders!inner (
          id,
          order_number,
          total_amount,
          payment_status,
          payment_method,
          created_at,
          user_id
        )
      `)
      .limit(5);
    
    if (requestsError) {
      console.error('❌ Cancellation requests query failed:', requestsError);
      return;
    }
    
    console.log('✅ Cancellation requests query successful');
    console.log('📊 Sample data:', JSON.stringify(requests, null, 2));

    // Test 4: Check auth users (admin access)
    console.log('\n📋 Test 4: Testing auth users access...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth users access failed:', authError);
      return;
    }
    
    console.log('✅ Auth users access successful');
    console.log('👥 Total users:', authUsers?.users?.length || 0);

    // Test 5: Create a test cancellation request (if no data exists)
    if (!requests || requests.length === 0) {
      console.log('\n📋 Test 5: Creating test data...');
      
      // First create a test order if none exists
      const { data: existingOrders } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
      
      if (!existingOrders || existingOrders.length === 0) {
        console.log('📦 Creating test order...');
        
        // Get first user for test order
        const firstUser = authUsers?.users?.[0];
        if (firstUser) {
          const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert([{
              user_id: firstUser.id,
              order_number: `TEST-${Date.now()}`,
              status: 'confirmed',
              payment_status: 'paid',
              payment_method: 'razorpay',
              total_amount: 999.99,
              currency: 'INR'
            }])
            .select()
            .single();
          
          if (orderError) {
            console.error('❌ Failed to create test order:', orderError);
            return;
          }
          
          console.log('✅ Test order created:', newOrder.id);
          
          // Now create test cancellation request
          const { data: newRequest, error: requestError } = await supabase
            .from('cancellation_requests')
            .insert([{
              order_id: newOrder.id,
              user_id: firstUser.id,
              reason: 'Test cancellation request',
              additional_details: 'This is a test cancellation request created by the debug script',
              status: 'pending'
            }])
            .select()
            .single();
          
          if (requestError) {
            console.error('❌ Failed to create test cancellation request:', requestError);
            return;
          }
          
          console.log('✅ Test cancellation request created:', newRequest.id);
        }
      }
    }

    console.log('\n🎉 All tests passed! Database connection is working.');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testDatabase();
