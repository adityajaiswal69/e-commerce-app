import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/products/ProductGrid";

export default async function ProductsPage() {
  const supabase = createServerSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Products</h1>
      <ProductGrid products={products || []} />
    </div>
  );
}
