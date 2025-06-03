import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/products/ProductGrid";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import HomeRecommendations from "@/components/recommendations/HomeRecommendations";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Image from "next/image";


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
  
  // Define industries we serve
  const industries = [
    "Hotels & Resorts",
    "Automotive Companies",
    "Manufacturing & Factories",
    "Hospitals & Healthcare",
    "Schools & Educational Institutions"
  ];
  
  // Define key features
  const keyFeatures = [
    "Custom Website Design",
    "Mobile & SEO Optimization",
    "Brand Integration",
    "Fast, Secure & Scalable Development",
    "Ongoing Support & Maintenance"
  ];

  return (
    <div className="space-y-16 py-0">
      {/* Hero Section */}
      <section className="bg-[#e9e2a3] px-4 py-16 pt-24 md:py-24 md:pt-32">
        <div className="container mx-auto text-center">
          <div className="mx-auto mb-6 md:mb-8 max-w-xs">
            <Image 
              src="/Logo-3.jpg" 
              alt="Uniformat Logo" 
              width={300} 
              height={100} 
              className="mx-auto w-48 md:w-auto"
              priority
            />
          </div>
          <h1 className="mb-3 md:mb-4 text-3xl font-bold text-[#333333] md:text-5xl lg:text-6xl">
            Tailored. Trusted. Timeless.
          </h1>
          <p className="mb-8 md:mb-10 text-lg text-[#444444] md:text-2xl">
            Custom Solutions for Exceptional Brands
          </p>
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-6 sm:space-y-0">
            <Link
              href="/contact"
              className="inline-block rounded-md bg-[#333333] px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-medium text-white transition-all hover:bg-[#222222] hover:shadow-lg"
            >
             Shop Now
            </Link>
            
          </div>
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl md:text-3xl font-bold text-[#333333] flex items-center">
            Top <span className="text-[#bfb875] ml-2">Categories</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {/* Category 1 - Hotel/Hospitality */}
            <Link href="/hotel-hospitality" className="flex flex-col items-center text-center group">
              <div className="relative mb-4 bg-gray-100 rounded-full p-8 w-24 h-24 flex items-center justify-center group-hover:bg-[#f8f6e1] transition-colors">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">20</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 text-[#333333]">
                  <path d="M2 20h20"/><path d="M5 4v16"/><path d="M19 4v16"/><path d="M5 12h14"/><path d="M5 8h14"/><path d="M5 16h14"/>
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-medium text-[#333333]">HOTEL</h3>
              <p className="text-xs md:text-sm text-[#555555]">HOSPITALITY</p>
            </Link>
            
            {/* Category 2 - School */}
            <Link href="/school" className="flex flex-col items-center text-center group">
              <div className="relative mb-4 bg-gray-100 rounded-full p-8 w-24 h-24 flex items-center justify-center group-hover:bg-[#f8f6e1] transition-colors">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">12</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 text-[#333333]">
                  <path d="m2 22 10-10M12 12l10 10"/><path d="M2 12h20"/><path d="M12 2v20"/>
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-medium text-[#333333]">SCHOOL</h3>
              <p className="text-xs md:text-sm text-[#555555]">UNIFORMS</p>
            </Link>
            
            {/* Category 3 - Automobile */}
            <Link href="/automobile" className="flex flex-col items-center text-center group">
              <div className="relative mb-4 bg-gray-100 rounded-full p-8 w-24 h-24 flex items-center justify-center group-hover:bg-[#f8f6e1] transition-colors">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">03</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 text-[#333333]">
                  <path d="M5 17h14v-6H5z"/><path d="M5 11V7a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/>
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-medium text-[#333333]">AUTOMOBILE</h3>
              <p className="text-xs md:text-sm text-[#555555]">UNIFORMS</p>
            </Link>
            
            {/* Category 4 - Corporate */}
            <Link href="/corporate" className="flex flex-col items-center text-center group">
              <div className="relative mb-4 bg-gray-100 rounded-full p-8 w-24 h-24 flex items-center justify-center group-hover:bg-[#f8f6e1] transition-colors">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">09</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 text-[#333333]">
                  <rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/>
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-medium text-[#333333]">CORPORATE</h3>
              <p className="text-xs md:text-sm text-[#555555]">UNIFORMS</p>
            </Link>
            
            {/* Category 5 - Restaurant/Cafe/Pub */}
            <Link href="/restaurant-cafe-pub" className="flex flex-col items-center text-center group">
              <div className="relative mb-4 bg-gray-100 rounded-full p-8 w-24 h-24 flex items-center justify-center group-hover:bg-[#f8f6e1] transition-colors">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">10</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 text-[#333333]">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15V2"/><path d="M15 2v13a3 3 0 0 0 3 3h3"/>
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-medium text-[#333333]">RESTAURANT</h3>
              <p className="text-xs md:text-sm text-[#555555]">CAFE/PUB</p>
            </Link>
            
            {/* Category 6 - Hospital */}
            <Link href="/hospital-uniform" className="flex flex-col items-center text-center group">
              <div className="relative mb-4 bg-gray-100 rounded-full p-8 w-24 h-24 flex items-center justify-center group-hover:bg-[#f8f6e1] transition-colors">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">05</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 text-[#333333]">
                  <path d="M8 3v2"/><path d="M16 3v2"/><path d="M21 12H3"/><path d="M3 5h18v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z"/><path d="M12 9v8"/><path d="M8 13h8"/>
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-medium text-[#333333]">HOSPITAL</h3>
              <p className="text-xs md:text-sm text-[#555555]">UNIFORMS</p>
            </Link>
          </div>
        </div>
      </section>
      
      {/* About Us Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
            Bringing Your Brand to Life Online
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555555]">
            We specialize in creating stunning, user-friendly websites that elevate your brand and engage your audience. 
            With a deep understanding of diverse industries — from hospitality to healthcare — our team delivers digital 
            experiences that are both visually compelling and strategically sound. We don't just build websites; we craft 
            timeless digital identities.
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="bg-[#f8f6e1] px-4 py-12 md:py-16">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
              Solutions That Reflect Your Vision
            </h2>
            <p className="mb-8 md:mb-12 text-base md:text-lg leading-relaxed text-[#555555]">
              Your brand is unique — and your website should be too. We work closely with you to design and develop a digital 
              presence that aligns with your goals and resonates with your audience. Whether you're a luxury hotel, a high-end 
              automobile company, an advanced manufacturing unit, a modern hospital, or an educational institution, we create 
              digital platforms that are built to impress.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="rounded-lg bg-white p-6 md:p-8 shadow-md transition-all hover:shadow-lg">
                <div className="mb-4 h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#e9e2a3] p-2 md:p-3">
                  <div className="h-full w-full rounded-full bg-[#333333]"></div>
                </div>
                <h3 className="mb-2 md:mb-3 text-lg md:text-xl font-semibold text-[#333333]">{feature}</h3>
                <p className="text-sm md:text-base text-[#666666]">
                  Our {feature.toLowerCase()} services ensure your digital presence stands out from the competition.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
            Tailored Solutions for Every Industry
          </h2>
          <p className="mb-8 md:mb-12 text-base md:text-lg leading-relaxed text-[#555555]">
            Our experience spans across industries where precision, trust, and timeless design matter most.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-6">
          {industries.map((industry, index) => (
            <div 
              key={index} 
              className="flex h-32 sm:h-36 md:h-40 flex-col items-center justify-center rounded-lg bg-[#f8f6e1] p-4 md:p-6 text-center shadow-sm transition-all hover:bg-[#e9e2a3] hover:shadow-md"
            >
              <div className="mb-3 md:mb-4 h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#333333] p-2 md:p-3">
                <div className="h-full w-full rounded-full bg-[#e9e2a3]"></div>
              </div>
              <span className="text-base md:text-lg font-medium text-[#333333]">
                {industry}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#333333] px-4 py-12 md:py-16 text-white">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 md:mb-6 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
              Professional. Dependable. Aesthetic.
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-[#e9e2a3]">
              We believe in clean, professional design that reflects your brand's values and stands the test of time. 
              No clutter. No gimmicks. Just a seamless, classy, and intuitive digital experience tailored for your audience.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products (if applicable) */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-[#333333]">Featured Products</h2>
            <Link 
              href="/products" 
              className="text-[#333333] underline decoration-[#e9e2a3] decoration-2 underline-offset-4 hover:text-[#555555]"
            >
              View All
            </Link>
          </div>
          <ProductGrid products={featuredProducts || []} />
        </section>
      )}

      {/* Call to Action */}
      <section className="bg-[#e9e2a3] px-4 py-14 md:py-20">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
            Ready to Elevate Your Digital Presence?
          </h2>
          <p className="mx-auto mb-8 md:mb-10 max-w-2xl text-base md:text-lg text-[#444444]">
            Partner with us and bring your brand vision to life with a website that's as refined and trustworthy as your business.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-md bg-[#333333] px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-medium text-white transition-all hover:bg-[#222222] hover:shadow-lg"
          >
            Let's Build Something Timeless
          </Link>
        </div>
      </section>

      {/* Newsletter Section (modified to match design) */}
      <section className="bg-[#f8f6e1] py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* <ErrorBoundary>
        <HomeRecommendations />
      </ErrorBoundary> */}
    </div>
  );
}
