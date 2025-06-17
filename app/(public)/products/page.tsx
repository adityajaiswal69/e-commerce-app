import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/products/ProductGrid";
import SearchAndFilter from "@/components/products/SearchAndFilter";
import { Metadata } from "next";

type SearchParams = {
  q?: string;
  category?: string;
  price?: string;
  sort?: string;
};

// Helper function to generate page title based on filters
function generatePageTitle(searchParams: SearchParams): string {
  if (searchParams.q) {
    return `Search Results for "${searchParams.q}" - Uniformat`;
  }

  if (searchParams.category) {
    const categoryTitle = searchParams.category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return `${categoryTitle} - Uniformat`;
  }

  return "All Products - Uniformat";
}

// Generate metadata for SEO
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const searchParamsData = await searchParams;
  const title = generatePageTitle(searchParamsData);

  let description = "Browse our wide selection of high-quality uniforms for various industries.";

  if (searchParamsData.category) {
    const categoryName = searchParamsData.category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    description = `Shop ${categoryName} at Uniformat. High-quality, professional uniforms for your industry needs.`;
  }

  return {
    title,
    description,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParamsData = await searchParams;
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
  if (searchParamsData.q) {
    query = query.ilike("name", `%${searchParamsData.q}%`);
  }

  // Apply category filter - this now handles both main categories and subcategory slugs
  if (searchParamsData.category) {
    // First try to match as a main category
    const mainCategoryQuery = supabase.from("products").select("*").eq("active", true).eq("category", searchParamsData.category);

    // Also try to match as a subcategory slug
    const subcategoryQuery = supabase
      .from("products")
      .select(`
        *,
        subcategories!inner(slug)
      `)
      .eq("active", true)
      .eq("subcategories.slug", searchParamsData.category);

    // For now, let's use a simpler approach - check if it's a known main category
    const mainCategories = [
      'hotel-hospitality', 'school', 'automobile', 'corporate',
      'restaurant-cafe-pub', 'speciality-industry', 'hospital-uniform',
      'medical-factory', 'catering-uniform', 'apron'
    ];

    if (mainCategories.includes(searchParamsData.category)) {
      // It's a main category
      query = query.eq("category", searchParamsData.category);
    } else {
      // It's likely a subcategory slug
      query = query
        .select(`
          *,
          subcategories!inner(slug)
        `)
        .eq("subcategories.slug", searchParamsData.category);
    }
  }

  // Apply price filter
  if (searchParamsData.price) {
    const [min, max] = searchParamsData.price.split("-");
    if (min && max) {
      query = query.gte("price", min).lte("price", max);
    } else if (min === "200+") {
      query = query.gte("price", 200);
    }
  }

  // Apply sorting
  if (searchParamsData.sort) {
    switch (searchParamsData.sort) {
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

  // Generate dynamic page title for display
  const pageTitle = generatePageTitle(searchParamsData).replace(' - Uniformat', '');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">{pageTitle}</h1>

      <div className="mb-8">
        <SearchAndFilter categories={uniqueCategories} />
      </div>

      <ProductGrid products={products || []} />
    </div>
  );
}
