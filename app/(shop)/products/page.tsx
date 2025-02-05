import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/products/ProductGrid";
import SearchAndFilter from "@/components/products/SearchAndFilter";

type SearchParams = {
  q?: string;
  category?: string;
  price?: string;
  sort?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createServerSupabaseClient();

  // Get unique categories for filter
  const { data: categories } = await supabase
    .from("products")
    .select("category")
    .eq("active", true);

  const uniqueCategories = Array.from(
    new Set(categories?.map((item) => item.category))
  );

  // Build query
  let query = supabase.from("products").select("*").eq("active", true);

  // Apply search
  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }

  // Apply category filter
  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }

  // Apply price filter
  if (searchParams.price) {
    const [min, max] = searchParams.price.split("-");
    if (min && max) {
      query = query.gte("price", min).lte("price", max);
    } else if (min === "200+") {
      query = query.gte("price", 200);
    }
  }

  // Apply sorting
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">All Products</h1>

      <div className="mb-8">
        <SearchAndFilter categories={uniqueCategories} />
      </div>

      <ProductGrid products={products || []} />
    </div>
  );
}
