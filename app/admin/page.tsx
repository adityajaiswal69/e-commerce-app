import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import AdminStats from "@/components/admin/AdminStats";
import RecentOrders from "@/components/admin/RecentOrders";
import ProductManagement from "@/components/admin/ProductManagement";

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient();

  // Fetch dashboard data
  const [
    { count: totalProducts },
    { count: totalOrders },
    { data: recentOrders },
    { data: products },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          product:products (
            name,
            image_url
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Calculate total revenue
  const { data: orderTotals } = await supabase
    .from("orders")
    .select("total_price");

  const totalRevenue =
    orderTotals?.reduce((sum, order) => sum + order.total_price, 0) ?? 0;

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
        totalProducts={totalProducts ?? 0}
        totalOrders={totalOrders ?? 0}
        totalRevenue={totalRevenue}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <RecentOrders orders={recentOrders ?? []} />
        <ProductManagement products={products ?? []} />
      </div>
    </div>
  );
}
