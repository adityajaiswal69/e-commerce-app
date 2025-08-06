import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminStats from "@/components/admin/AdminStats";
import RecentOrders from "@/components/admin/RecentOrders";
import ProductManagement from "@/components/admin/ProductManagement";
import type { Order } from "@/types/orders";

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();

  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/sign-in");
    }

    // Check admin role using profiles table (proper method)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      redirect("/");
    }

    // Fetch recent orders with order items
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        status,
        order_number,
        payment_status,
        user_id,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          product_snapshot,
          products (
            id,
            name,
            front_image_url,
            price
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    // Handle orders data safely - if complex query fails, use simple fallback
    let orders: Order[] = [];

    if (ordersData && !ordersError) {
      orders = ordersData;
    } else {
      // Fallback: fetch simple orders without items
      const { data: simpleOrders } = await supabase
        .from("orders")
        .select("id, created_at, total_amount, status, order_number, payment_status")
        .order("created_at", { ascending: false })
        .limit(5);

      orders = (simpleOrders || []).map(order => ({
        ...order,
        order_items: []
      }));
    }

    // Fetch recent products with basic fields
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price, front_image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    // Get total products count
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Get orders stats
    const { data: stats } = await supabase
      .from("orders")
      .select("status, total_amount");

    const totalRevenue =
      stats?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    const pendingOrders =
      stats?.filter((order) => order.status === "pending").length || 0;

    const completedOrders =
      stats?.filter((order) => order.status === "delivered").length || 0;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link
            href="/admin/products/new"
            className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            Add New Product
          </Link>
        </div>

        <AdminStats
          totalProducts={totalProducts || 0}
          totalOrders={stats?.length || 0}
          totalRevenue={totalRevenue}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <RecentOrders orders={orders || []} />
          <ProductManagement products={products || []} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="mt-2 text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="mt-2 text-2xl font-bold">{stats?.length || 0}</p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
            <p className="mt-2 text-2xl font-bold">{pendingOrders}</p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-medium text-gray-500">
              Completed Orders
            </h3>
            <p className="mt-2 text-2xl font-bold">{completedOrders}</p>
          </div>
        </div>
      </div>
    );

  } catch (error) {
    // Handle any errors gracefully
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="mt-2 text-red-700">
                There was an error loading the admin dashboard. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>

        {/* Fallback dashboard with empty data */}
        <AdminStats
          totalProducts={0}
          totalOrders={0}
          totalRevenue={0}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <RecentOrders orders={[]} />
          <ProductManagement products={[]} />
        </div>
      </div>
    );
  }
}
