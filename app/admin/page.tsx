import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminStats from "@/components/admin/AdminStats";
import RecentOrders from "@/components/admin/RecentOrders";
import ProductManagement from "@/components/admin/ProductManagement";
import { Database } from "@/types/database.types";
import type { Order } from "@/types/orders";

export default async function AdminDashboard() {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Check if user is authenticated and is admin
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Fetch recent orders with all necessary details
  const { data: ordersData } = await supabase
    .from("orders")
    .select(
      `
      *
    `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  // Remove the inner joins as they might be filtering out orders
  // Add debug logging
  console.log("Raw orders data:", ordersData);
  const orders = ordersData as unknown as Order[];

  // Fetch recent products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get total products count
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  // Get orders stats
  const { data: stats } = await supabase.from("orders").select("status, total");

  const totalRevenue =
    stats?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

  const pendingOrders =
    stats?.filter((order) => order.status === "pending").length || 0;

  const completedOrders =
    stats?.filter((order) => order.status === "paid").length || 0;

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
          <p className="mt-2 text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
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
}
