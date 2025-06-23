import { createServerSupabaseClient } from "@/lib/supabase/server";
import CancellationRequestsClient from "@/components/admin/CancellationRequestsClient";

export default async function CancellationRequestsPage() {
  const supabase = createServerSupabaseClient();

  console.log('🔍 Fetching cancellation requests...');

  try {
    // First, check if the current user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('❌ Auth error:', authError);
      throw new Error('Authentication failed');
    }

    if (!user) {
      console.error('❌ No authenticated user');
      throw new Error('User not authenticated');
    }

    console.log('✅ User authenticated:', user.email);

    // Check admin role using profiles table (proper method)
    console.log('🔍 Checking admin role from profiles table...');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      throw new Error(`Database error: Could not fetch user profile. ${profileError.message}`);
    }

    if (!profile) {
      console.error('❌ No profile found for user:', user.email);
      throw new Error(`No profile found for user ${user.email}. Please contact administrator.`);
    }

    console.log('👤 User profile:', { role: profile.role, email: user.email });

    const isAdmin = profile.role === 'admin';
    console.log('🔐 User admin status:', isAdmin);

    if (!isAdmin) {
      console.error('❌ Admin access denied. User role:', profile.role);
      throw new Error(`Insufficient permissions - admin access required. User ${user.email} has role '${profile.role}' but needs 'admin' role.`);
    }

    // Fetch cancellation requests with real user emails using the view
    console.log('📊 Fetching cancellation requests with user emails...');

    let cancellationRequestsData = null;
    let fetchError = null;

    // Try to fetch from the view first
    try {
      const result = await supabase
        .from('cancellation_requests_with_emails')
        .select('*')
        .order('created_at', { ascending: false });

      cancellationRequestsData = result.data;
      fetchError = result.error;

      if (fetchError) {
        console.warn('⚠️ View query failed, trying fallback:', fetchError);
        throw fetchError;
      }

      console.log(`✅ Found ${cancellationRequestsData?.length || 0} cancellation requests with emails`);

    } catch (viewError) {
      console.warn('⚠️ View not available, using fallback query:', viewError);

      // Fallback: Use basic query with manual email handling
      const fallbackResult = await supabase
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
        .order('created_at', { ascending: false });

      if (fallbackResult.error) {
        console.error('❌ Fallback query also failed:', fallbackResult.error);
        throw fallbackResult.error;
      }

      // Transform fallback data to match view format
      cancellationRequestsData = (fallbackResult.data || []).map(req => ({
        ...req,
        order_id_ref: req.orders.id,
        order_number: req.orders.order_number || `ORD-${req.orders.id.slice(0, 8)}`,
        total_amount: req.orders.total_amount || 0,
        payment_status: req.orders.payment_status || 'unknown',
        payment_method: req.orders.payment_method || 'unknown',
        order_created_at: req.orders.created_at,
        order_user_id: req.orders.user_id,
        user_email: `user-${req.orders.user_id?.slice(0, 8) || 'unknown'}@example.com`
      }));

      console.log(`✅ Fallback: Found ${cancellationRequestsData?.length || 0} cancellation requests`);
    }

    // Transform the data to match the expected format
    // Handle both view data and fallback data
    const requestsWithUserData = (cancellationRequestsData || []).map(req => {
      // Handle both view format and fallback format
      const isViewFormat = req.user_email !== undefined;
      const isFallbackFormat = req.orders !== undefined;

      if (isViewFormat) {
        // Data from the view
        return {
          id: req.id,
          order_id: req.order_id,
          user_id: req.user_id,
          reason: req.reason,
          additional_details: req.additional_details,
          status: req.status,
          admin_notes: req.admin_notes,
          processed_by: req.processed_by,
          processed_at: req.processed_at,
          refund_amount: req.refund_amount,
          refund_status: req.refund_status,
          created_at: req.created_at,
          updated_at: req.updated_at,
          orders: {
            id: req.order_id_ref || req.order_id,
            order_number: req.order_number,
            total_amount: req.total_amount,
            payment_status: req.payment_status,
            payment_method: req.payment_method,
            created_at: req.order_created_at,
            user_id: req.order_user_id
          },
          users: {
            email: req.user_email, // Real email from database function
            raw_user_meta_data: {}
          }
        };
      } else if (isFallbackFormat) {
        // Data from fallback query
        return {
          id: req.id,
          order_id: req.order_id,
          user_id: req.user_id,
          reason: req.reason,
          additional_details: req.additional_details,
          status: req.status,
          admin_notes: req.admin_notes,
          processed_by: req.processed_by,
          processed_at: req.processed_at,
          refund_amount: req.refund_amount,
          refund_status: req.refund_status,
          created_at: req.created_at,
          updated_at: req.updated_at,
          orders: {
            id: req.orders.id,
            order_number: req.orders.order_number || `ORD-${req.orders.id.slice(0, 8)}`,
            total_amount: req.orders.total_amount,
            payment_status: req.orders.payment_status,
            payment_method: req.orders.payment_method,
            created_at: req.orders.created_at,
            user_id: req.orders.user_id
          },
          users: {
            email: req.user_email || `user-${req.orders?.user_id?.slice(0, 8) || 'unknown'}@example.com`,
            raw_user_meta_data: {}
          }
        };
      } else {
        // Transformed fallback data
        return {
          id: req.id,
          order_id: req.order_id,
          user_id: req.user_id,
          reason: req.reason,
          additional_details: req.additional_details,
          status: req.status,
          admin_notes: req.admin_notes,
          processed_by: req.processed_by,
          processed_at: req.processed_at,
          refund_amount: req.refund_amount,
          refund_status: req.refund_status,
          created_at: req.created_at,
          updated_at: req.updated_at,
          orders: {
            id: req.order_id_ref,
            order_number: req.order_number,
            total_amount: req.total_amount,
            payment_status: req.payment_status,
            payment_method: req.payment_method,
            created_at: req.order_created_at,
            user_id: req.order_user_id
          },
          users: {
            email: req.user_email,
            raw_user_meta_data: {}
          }
        };
      }
    });

    console.log(`✅ Transformed ${requestsWithUserData.length} requests with user emails`);

    console.log(`🎯 Final result: ${requestsWithUserData.length} requests with user data`);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cancellation Requests</h1>
          <p className="mt-2 text-gray-600">
            Manage customer order cancellation requests ({requestsWithUserData.length} total)
          </p>
        </div>

        <CancellationRequestsClient
          initialRequests={requestsWithUserData}
        />
      </div>
    );

  } catch (error: any) {
    console.warn('⚠️ Error in CancellationRequestsPage:', error);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cancellation Requests</h1>
          <p className="mt-2 text-gray-600">
            Manage customer order cancellation requests
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Cancellation Requests</h3>
              <p className="mt-2 text-red-700">
                {error.message || 'An unexpected error occurred while loading the cancellation requests.'}
              </p>
              <div className="mt-4">
                <details className="text-sm">
                  <summary className="cursor-pointer text-red-600 hover:text-red-800">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Fallback: Show empty state */}
        <CancellationRequestsClient initialRequests={[]} />
      </div>
    );
  }
}
