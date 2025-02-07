import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/products/ProductGrid";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import HomeRecommendations from "@/components/recommendations/HomeRecommendations";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  // Fetch featured products (latest 8 active products)
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  // Get unique categories
  const { data: categories } = await supabase
    .from("products")
    .select("category")
    .eq("active", true)
    .order("category")
    .limit(6);

  const uniqueCategories = Array.from(
    new Set(categories?.map((item) => item.category))
  );

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="bg-blue-50 px-4 py-16">
        <div className="container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Welcome to Our Store
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Discover our amazing products at great prices
          </p>
          <Link
            href="/products"
            className="inline-block rounded-md bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/products" className="text-blue-500 hover:text-blue-600">
            View All
          </Link>
        </div>
        <ProductGrid products={featuredProducts || []} />
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {uniqueCategories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${category}`}
                className="flex h-24 items-center justify-center rounded-lg bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-lg font-medium text-gray-900">
                  {category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterForm />

      <ErrorBoundary>
        <HomeRecommendations />
      </ErrorBoundary>
    </div>
  );
}
