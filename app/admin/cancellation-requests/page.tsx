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

    // Fetch cancellation requests with order details
    console.log('📊 Fetching cancellation requests from database...');

    const { data: cancellationRequests, error: fetchError } = await supabase
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

    if (fetchError) {
      console.error('❌ Database fetch error:', fetchError);
      throw fetchError;
    }

    console.log(`✅ Found ${cancellationRequests?.length || 0} cancellation requests`);

    // Get user emails for the cancellation requests
    let requestsWithUserData = cancellationRequests || [];

    if (cancellationRequests && cancellationRequests.length > 0) {
      console.log('👥 Fetching user data for cancellation requests...');

      try {
        // Get unique user IDs from the orders
        const userIds = [...new Set(cancellationRequests.map(req => req.orders?.user_id).filter(Boolean))];
        console.log(`📋 Found ${userIds.length} unique user IDs:`, userIds);

        // Try to fetch user data from auth.users (admin only)
        // This might fail due to permissions, so we'll handle it gracefully
        let userData = null;
        try {
          const { data: authData, error: userError } = await supabase.auth.admin.listUsers();
          if (userError) {
            console.warn('⚠️ Could not fetch user data (admin permission required):', userError);
            userData = null;
          } else {
            userData = authData;
          }
        } catch (adminError) {
          console.warn('⚠️ Admin API access failed:', adminError);
          userData = null;
        }

        console.log(`👤 Fetched ${userData?.users?.length || 0} users from auth`);

        // Create a map of user ID to user data
        const userMap = new Map();
        if (userData?.users) {
          userData.users.forEach(user => {
            userMap.set(user.id, {
              email: user.email || `user-${user.id.slice(0, 8)}@example.com`,
              raw_user_meta_data: user.user_metadata || {}
            });
          });
          console.log(`🗺️ Created user map with ${userMap.size} entries`);
        } else {
          console.log('🗺️ No user data available, will use fallback display names');
        }

        // Add user data to cancellation requests
        requestsWithUserData = cancellationRequests.map(req => {
          const userData = userMap.get(req.orders?.user_id);
          return {
            ...req,
            users: userData || {
              email: `user-${req.orders?.user_id?.slice(0, 8) || 'unknown'}@example.com`,
              raw_user_meta_data: {}
            }
          };
        });

        console.log('✅ Successfully mapped user data to cancellation requests');

      } catch (userFetchError) {
        console.warn('⚠️ Could not fetch user data, using fallback:', userFetchError);

        // Fallback: use user IDs as display names
        requestsWithUserData = cancellationRequests.map(req => ({
          ...req,
          users: {
            email: `user-${req.orders?.user_id?.slice(0, 8) || 'unknown'}@example.com`,
            raw_user_meta_data: {}
          }
        }));
      }
    }

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
    console.error('💥 Critical error in CancellationRequestsPage:', error);

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
