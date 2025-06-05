import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/products/ProductGrid";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import LogoTicker from "@/components/elements/logoticker";
import Testimonials from "@/components/sections/Testimonials";
import HomeRecommendations from "@/components/recommendations/HomeRecommendations";
import BestSellingProducts from "@/components/products/BestSellingProducts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Image from "next/image";
import HeroSlider from "@/components/HeroSlider";

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

// Define industries we serve with images and fallback colors
const industries = [
  {
    id: 1,
    title: "HOTELS &",
    subtitle: "RESORTS",
    description: "Luxury hospitality solutions",
    image: "/images/industries/hotels-resorts.jpg", // Add your image path here or set to null
    fallbackColor: "from-slate-800 to-slate-600",
    icon: (
      <svg className="h-6 w-6 text-[#333333]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12V6H4v10h12z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    id: 2,
    title: "AUTOMOTIVE",
    subtitle: "COMPANIES",
    description: "Professional automotive solutions",
    image: "/images/industries/automative.jpg", // No image - will use fallback color
    fallbackColor: "from-gray-900 to-gray-700",
    icon: (
      <svg className="h-6 w-6 text-[#333333]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    id: 3,
    title: "MANUFACTURING",
    subtitle: "& FACTORIES",
    description: "Industrial excellence solutions",
    image: "/images/industries/manufacturing.jpg", // Add your image path here or set to null
    fallbackColor: "from-blue-900 to-blue-700",
    icon: (
      <svg className="h-6 w-6 text-[#333333]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    id: 4,
    title: "HOSPITALS &",
    subtitle: "HEALTHCARE",
    description: "Medical care solutions",
    image: "/images/industries/Medical.jpg", // No image - will use fallback color
    fallbackColor: "from-teal-800 to-teal-600",
    icon: (
      <svg className="h-6 w-6 text-[#333333]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    id: 5,
    title: "SCHOOLS &",
    subtitle: "EDUCATIONAL",
    extraSubtitle: "INSTITUTIONS",
    description: "Educational excellence solutions",
    image: "/images/industries/education.jpg", // Add your image path here or set to null
    fallbackColor: "from-indigo-800 to-indigo-600",
    icon: (
      <svg className="h-6 w-6 text-[#333333]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    )
  }
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
    <div className="space-y-8 sm:space-y-12 md:space-y-16 py-0">
      {/* Hero Section with Animated Category Slider */}
      <section className="w-full">
        <HeroSlider />
      </section>
      {/* Industries We Serve */}
<section className="container mx-auto px-4 py-5 md:py-8">
  <div className="mx-auto max-w-4xl text-center">
    <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
      Tailored Solutions for Every Industry
    </h2>
    <p className="mb-8 md:mb-12 text-base md:text-lg leading-relaxed text-[#555555]">
      Our experience spans across industries where precision, trust, and timeless design matter most.
    </p>
  </div>
  
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
    {industries.map((industry, index) => (
      <div 
        key={index} 
        className={`relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg group cursor-pointer transition-transform hover:scale-105 ${
          index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
        }`}
      >
        {/* Background Image or Gradient */}
        {industry.image ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${industry.image})` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${industry.fallbackColor}`}></div>
        )}
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-6">
          {/* <div className="mb-4 h-12 w-12 rounded-full bg-[#e9e2a3] flex items-center justify-center">
            {industry.icon}
          </div> */}
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{industry.title}</h3>
          <h3 className="text-xl md:text-2xl font-bold text-white">{industry.subtitle}</h3>
          {industry.extraSubtitle && (
            <h3 className="text-xl md:text-2xl font-bold text-white">{industry.extraSubtitle}</h3>
          )}
          <p className="text-sm text-gray-200 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {industry.description}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>
      {/* Top Categories Section */}
      {/* About Us Section */}
      <section className="container mx-auto px-4 py-5 md:py-8">
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
      {/* Best Selling Products with Category Filtering */}
      {featuredProducts && featuredProducts.length > 0 && (
            <BestSellingProducts products={featuredProducts} />
          )}
      
        
      {/* What We Do Section */}
      {/* <section className="bg-[#f8f6e1] px-4 py-12 md:py-16">
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
      </section> */}

      

      {/* Why Choose Us with Clients */}
      <section className="bg-[#333333] px-4 py-5 md:py-10 text-white">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16">
            <h2 className="mb-4 md:mb-6 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
              Professional. Dependable. Aesthetic.
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-[#e9e2a3] max-w-3xl mx-auto">
              We believe in clean, professional design that reflects your brand's values and stands the test of time. 
              No clutter. No gimmicks. Just a seamless, classy, and intuitive digital experience tailored for your audience.
            </p>
          </div>
          
          {/* Integrated LogoTicker */}
          <div className="mt-8 md:mt-12">
           
            <LogoTicker />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />
      {/* Newsletter Section (modified to match design) */}
      <section className="bg-[#f8f6e1] py-5 md:py-10">
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
