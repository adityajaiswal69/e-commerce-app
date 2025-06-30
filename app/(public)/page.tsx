import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/products/ProductGrid";
import Link from "next/link";
import BulkInquiryForm from "@/components/BulkInquiryForm";
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
    image: "/images/industries/hotelANDresort.jpg",
    fallbackColor: "from-slate-800 to-slate-600",
  },
  {
    id: 2,
    title: "CASINO",
    subtitle: "WEAR",
    description: "Elegant uniforms for casino staff",
    image: "/images/industries/casino.jpg",
    fallbackColor: "from-yellow-900 to-yellow-700",
  },
  {
    id: 3,
    title: "MEDICAL",
    subtitle: "FACTORY",
    description: "Uniforms for pharmaceutical production",
    image: "/images/industries/medical.jpg",
    fallbackColor: "from-red-900 to-red-700",
  },
  {
    id: 4,
    title: "SECURITY",
    subtitle: "",
    description: "Professional security attire",
    image: "/images/industries/security.jpg",
    fallbackColor: "from-gray-800 to-gray-600",
  },
  {
    id: 5,
    title: "CHEF",
    subtitle: "WEAR",
    description: "Premium chef coats and aprons",
    image: "/images/industries/chef.png",
    fallbackColor: "from-orange-800 to-orange-600",
  },
  {
    id: 6,
    title: "CORPORATE",
    subtitle: "OFFICES",
    description: "Formal attire for professionals",
    image: "/images/industries/corporate.png",
    fallbackColor: "from-blue-900 to-blue-700",
  },
  {
    id: 7,
    title: "CAFES/",
    subtitle: "RESTAURANTS/PUBS",
    description: "Stylish uniforms for food service",
    image: "/images/industries/cafe.png",
    fallbackColor: "from-brown-800 to-brown-600",
  },
  {
    id: 8,
    title: "CATERING",
    subtitle: "SERVICES",
    description: "Functional attire for catering staff",
    image: "/images/industries/catering.jpg",
    fallbackColor: "from-green-900 to-green-700",
  },
  {
    id: 9,
    title: "PHARMACEUTICAL",
    subtitle: "FACTORIES",
    description: "Sanitized and safe uniforms",
    image: "/images/industries/pharma.jpg",
    fallbackColor: "from-purple-900 to-purple-700",
  },
  {
    id: 10,
    title: "HOSPITAL",
    subtitle: "ATTIRE",
    description: "Comfortable and sterile garments",
    image: "/images/industries/hospital.png",
    fallbackColor: "from-cyan-800 to-cyan-600",
  },
  {
    id: 11,
    title: "SCHOOLS &",
    subtitle: "INSTITUTIONS",
    description: "Educational excellence solutions",
    image: "/images/industries/school.jpg",
    fallbackColor: "from-indigo-800 to-indigo-600",
  },
  {
    id: 12,
    title: "TSHIRTS/",
    subtitle: "HOODIES",
    description: "Casual wear for all occasions",
    image: "/images/industries/tshirts.png",
    fallbackColor: "from-pink-800 to-pink-600",
  },
  {
    id: 13,
    title: "DESIGNER",
    subtitle: "APRONS",
    description: "Trendy and functional aprons",
    image: "/images/industries/apron.png",
    fallbackColor: "from-lime-900 to-lime-700",
  },
  {
    id: 14,
    title: "AUTOMOBILE",
    subtitle: "",
    description: "Professional automotive solutions",
    image: "/images/industries/automative.jpg",
    fallbackColor: "from-gray-900 to-gray-700",
  },
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
      
      {/* Desktop: Horizontal expanding cards */}
<div className="hidden lg:flex gap-2 justify-center items-center h-80 group/container">
  {industries.map((industry, index) => (
    <div 
      key={industry.id} 
      className={`group relative h-full rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-700 ease-out flex-shrink-0 ${
        index === 0 
          ? 'w-72 group-hover/container:w-16 hover:!w-72' 
          : 'w-16 hover:w-72'
      }`}
      style={{
        backgroundImage: industry.image ? `url(${industry.image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Fallback gradient if no image */}
      {!industry.image && (
        <div className={`absolute inset-0 bg-gradient-to-br ${industry.fallbackColor}`}></div>
      )}
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-40 transition-opacity duration-700"></div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-4">
        {/* Collapsed state - vertical text */}
        <div className={`${
          index === 0 
            ? 'opacity-0 group-hover/container:opacity-100 group-hover:opacity-0' 
            : 'group-hover:opacity-0'
        } transition-opacity duration-300 flex flex-col items-center justify-center h-full`}>
          <div className="transform rotate-90 origin-center whitespace-nowrap">
            <h3 className="text-sm font-bold text-white tracking-wider">
              {industry.title} {industry.subtitle}
            </h3>
          </div>
        </div>
        
        {/* Expanded state - horizontal content */}
        <div className={`absolute inset-0 ${
          index === 0 
            ? 'opacity-100 group-hover/container:opacity-0 group-hover:opacity-100' 
            : 'opacity-0 group-hover:opacity-100'
        } transition-all duration-500 delay-200 flex flex-col justify-center items-center text-center p-6`}>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-300">
            {industry.title}
          </h3>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-400">
            {industry.subtitle}
          </h3>
          
          <p className="text-sm text-gray-200 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-600">
            {industry.description}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

      {/* Mobile and Tablet: Traditional grid with hover effects */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden sm:gap-6">
        {industries.map((industry, index) => (
          <div 
            key={industry.id} 
            className="group relative h-48 md:h-56 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
          >
            {/* Background Image or Gradient */}
            {industry.image ? (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                style={{ backgroundImage: `url(${industry.image})` }}
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-r ${industry.fallbackColor} transform group-hover:scale-110 transition-transform duration-700`}></div>
            )}
            
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity duration-500"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-4">
              
              <h3 className="text-lg md:text-xl font-bold text-white mb-1 transform group-hover:translate-y-1 transition-transform duration-300">
                {industry.title}
              </h3>
              <h3 className="text-lg md:text-xl font-bold text-white transform group-hover:translate-y-1 transition-transform duration-300">
                {industry.subtitle}
              </h3>
              
              <p className="text-xs text-gray-200 mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                {industry.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
    
      {/* View All Products Button */}
      <section className="flex justify-center ">
        <Link
          href="/products"
          className="inline-flex items-center px-8 py-3 bg-[#333333] text-white font-medium rounded-md hover:bg-[#555555] transition-colors duration-300"
        >
          View All Products
          <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
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
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 md:mb-6 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
              Professional. Dependable. Aesthetic.
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-[#e9e2a3] max-w-3xl mx-auto">
              We believe in clean, professional design that reflects your brand's values and stands the test of time. 
              No clutter. No gimmicks. Just a seamless, classy, and intuitive digital experience tailored for your audience.
            </p>
          </div>
          
          {/* Integrated LogoTicker */}
          
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />
      {/* Newsletter Section (modified to match design) */}
      <div className="mt-8 md:mt-12">
           
            <LogoTicker />
          </div>
      <section className="py-5 md:py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <BulkInquiryForm />
          </div>
        </div>
      </section>

      {/* <ErrorBoundary>
        <HomeRecommendations />
      </ErrorBoundary> */}
    </div>
  );
}
