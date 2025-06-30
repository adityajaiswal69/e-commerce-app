import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/products/ProductGrid";
import SearchAndFilter from "@/components/products/SearchAndFilter";
import Pagination from "@/components/products/Pagination";
import { Metadata } from "next";

type SearchParams = {
  q?: string;
  category?: string;
  subcategory?: string;
  price?: string;
  sort?: string;
  page?: string;
};

const PRODUCTS_PER_PAGE = 12;

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

  // Get current page (default to 1)
  const currentPage = parseInt(searchParamsData.page || '1', 10);
  const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;

  // Get categories with subcategories for filter
  const { data: categoriesData } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      subcategories(id, name, slug)
    `)
    .order('display_order', { ascending: true });

  // For backward compatibility, also get unique product categories
  const { data: productCategories } = await supabase
    .from("products")
    .select("category")
    .eq("active", true);

  const uniqueCategories = Array.from(
    new Set(productCategories?.map((item) => item.category))
  );

  // Build base query for counting total products
  let countQuery = supabase.from("products").select("*", { count: 'exact', head: true }).eq("active", true);

  // Build query for fetching products
  let query = supabase.from("products").select("*").eq("active", true);

  // Apply search filters to both queries
  if (searchParamsData.q) {
    const searchCondition = `%${searchParamsData.q}%`;
    query = query.ilike("name", searchCondition);
    countQuery = countQuery.ilike("name", searchCondition);
  }

  // Apply category and subcategory filters to both queries
  if (searchParamsData.category || searchParamsData.subcategory) {
    if (searchParamsData.subcategory) {
      // Filter by specific subcategory - get products that belong to this subcategory
      const { data: subcategoryData } = await supabase
        .from("subcategories")
        .select("id, categories!inner(slug)")
        .eq("slug", searchParamsData.subcategory)
        .eq("categories.slug", searchParamsData.category)
        .single();

      if (subcategoryData) {
        query = query.eq("subcategory_id", subcategoryData.id);
        countQuery = countQuery.eq("subcategory_id", subcategoryData.id);
      } else {
        // If subcategory not found, return empty results
        const emptyCondition = "00000000-0000-0000-0000-000000000000";
        query = query.eq("id", emptyCondition);
        countQuery = countQuery.eq("id", emptyCondition);
      }
    } else if (searchParamsData.category) {
      // Filter by category - show all products in this category
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id, subcategories(id)")
        .eq("slug", searchParamsData.category)
        .single();

      if (categoryData) {
        // Get all subcategory IDs for this category
        const subcategoryIds = categoryData.subcategories?.map((sub: any) => sub.id) || [];

        if (subcategoryIds.length > 0) {
          // Filter products that either have the main category OR belong to any subcategory
          const filterCondition = `category.eq.${searchParamsData.category},subcategory_id.in.(${subcategoryIds.join(',')})`;
          query = query.or(filterCondition);
          countQuery = countQuery.or(filterCondition);
        } else {
          // No subcategories, just filter by main category
          query = query.eq("category", searchParamsData.category);
          countQuery = countQuery.eq("category", searchParamsData.category);
        }
      } else {
        // If category not found, return empty results
        const emptyCondition = "00000000-0000-0000-0000-000000000000";
        query = query.eq("id", emptyCondition);
        countQuery = countQuery.eq("id", emptyCondition);
      }
    }
  }

  // Apply price filter to both queries
  if (searchParamsData.price) {
    const [min, max] = searchParamsData.price.split("-");
    if (min && max) {
      query = query.gte("price", min).lte("price", max);
      countQuery = countQuery.gte("price", min).lte("price", max);
    } else if (min === "200+") {
      query = query.gte("price", 200);
      countQuery = countQuery.gte("price", 200);
    }
  }

  // Get total count
  const { count: totalProducts } = await countQuery;

  // Apply sorting and pagination to products query
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

  // Apply pagination
  query = query.range(offset, offset + PRODUCTS_PER_PAGE - 1);

  const { data: products } = await query;

  // Calculate pagination info
  const totalPages = Math.ceil((totalProducts || 0) / PRODUCTS_PER_PAGE);

  // Generate dynamic page title for display
  const pageTitle = generatePageTitle(searchParamsData).replace(' - Uniformat', '');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 mt-5 text-2xl font-bold">{pageTitle}</h1>

      <div className="mb-8">
        <SearchAndFilter
          categories={uniqueCategories}
          categoriesData={categoriesData || []}
        />
      </div>

      {/* Products count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {products?.length || 0} of {totalProducts || 0} products
        {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
      </div>

      <ProductGrid products={products || []} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={searchParamsData}
          />
        </div>
      )}
    </div>
  );
}