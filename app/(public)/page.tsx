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
    slug: "category=hotel-resorts",
  },
  {
    id: 2,
    title: "CASINO",
    subtitle: "WEAR",
    description: "Elegant uniforms for casino staff",
    image: "/images/industries/casino.jpg",
    fallbackColor: "from-yellow-900 to-yellow-700",
    slug: "category=casino",
  },
  {
    id: 3,
    title: "MEDICAL",
    subtitle: "FACTORY",
    description: "Uniforms for pharmaceutical production",
    image: "/images/industries/medi.jpg",
    fallbackColor: "from-red-900 to-red-700",
    slug: "category=medical-factory",
  },
  {
    id: 4,
    title: "SECURITY",
    subtitle: "",
    description: "Professional security attire",
    image: "/images/industries/security.jpg",
    fallbackColor: "from-gray-800 to-gray-600",
    slug: "category=security-uniforms",
  },
  {
    id: 5,
    title: "CHEF",
    subtitle: "WEAR",
    description: "Premium chef coats and aprons",
    image: "/images/industries/chef.png",
    fallbackColor: "from-orange-800 to-orange-600",
    slug: "category=chef",
  },
  {
    id: 6,
    title: "CORPORATE",
    subtitle: "OFFICES",
    description: "Formal attire for professionals",
    image: "/images/industries/corporate.png",
    fallbackColor: "from-blue-900 to-blue-700",
    slug: "category=corporate-offices",
  },
  {
    id: 7,
    title: "CAFES/",
    subtitle: "RESTAURANTS/PUBS",
    description: "Stylish uniforms for food service",
    image: "/images/industries/cafe.png",
    fallbackColor: "from-brown-800 to-brown-600",
    slug: "category=cafes-restaurants-pubs",
  },
  {
    id: 8,
    title: "CATERING",
    subtitle: "SERVICES",
    description: "Functional attire for catering staff",
    image: "/images/industries/catering.jpg",
    fallbackColor: "from-green-900 to-green-700",
    slug: "category=catering",
  },
  {
    id: 9,
    title: "PHARMACEUTICAL",
    subtitle: "FACTORIES",
    description: "Sanitized and safe uniforms",
    image: "/images/industries/pharma.jpg",
    fallbackColor: "from-purple-900 to-purple-700",
    slug: "category=pharmaceutical-factories",
  },
  {
    id: 10,
    title: "HOSPITAL",
    subtitle: "ATTIRE",
    description: "Comfortable and sterile garments",
    image: "/images/industries/hospital.png",
    fallbackColor: "from-cyan-800 to-cyan-600",
    slug: "category=hospital-attire",
  },
  {
    id: 11,
    title: "SCHOOLS &",
    subtitle: "INSTITUTIONS",
    description: "Educational excellence solutions",
    image: "/images/industries/school.jpg",
    fallbackColor: "from-indigo-800 to-indigo-600",
    slug: "category=schools-intitusions",
  },
  {
    id: 12,
    title: "TSHIRTS/",
    subtitle: "HOODIES",
    description: "Casual wear for all occasions",
    image: "/images/industries/tshirts.png",
    fallbackColor: "from-pink-800 to-pink-600",
    slug: "category=tshirts-hoodies",
  },
  {
    id: 13,
    title: "DESIGNER",
    subtitle: "APRONS",
    description: "Trendy and functional aprons",
    image: "/images/industries/apron.png",
    fallbackColor: "from-lime-900 to-lime-700",
    slug: "category=+designer-apron",
  },
  {
    id: 14,
    title: "AUTOMOBILE",
    subtitle: "",
    description: "Professional automotive solutions",
    image: "/images/industries/automative.jpg",
    fallbackColor: "from-gray-900 to-gray-700",
    slug: "category=automobile",
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
   
    <Link
      href={`/products?${industry.slug}`}
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
    
    </Link>
  ))}
</div>

      {/* Mobile and Tablet: Traditional grid with hover effects */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden sm:gap-6">
        {industries.map((industry, index) => (
          <Link
            href={`/products?${industry.slug}`}
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
          </Link>
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
      
    {/* Custom Design Tool Section */}
      <section className="bg-gradient-to-br from-[#f8f6e1] to-[#e9e2a3] px-4 py-12 md:py-16">
        <div className="container mx-auto">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
                Design Your Vision with Our Advanced Design Tool
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-[#555555] max-w-3xl mx-auto">
                Transform your ideas into reality with our professional design platform. Create custom uniforms, 
                apparel, and branded merchandise with industry-leading precision and style.
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              
              {/* Left Column - Design Tool Preview */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 transform hover:scale-105 transition-transform duration-500">
                  {/* Mock Design Interface */}
                  <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Professional Design Studio</span>
                    </div>
                    
                    {/* Design Canvas Mockup */}
                    <div className="bg-white rounded-lg p-4 h-40 md:h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#333333] rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">Your Custom Design Here</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tool Features */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#333333] rounded-full"></div>
                      <span className="text-xs text-gray-600">Logo Upload</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#333333] rounded-full"></div>
                      <span className="text-xs text-gray-600">Color Picker</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#333333] rounded-full"></div>
                      <span className="text-xs text-gray-600">Text Editor</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#333333] rounded-full"></div>
                      <span className="text-xs text-gray-600">Size Guide</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-[#333333] text-white px-3 py-1 rounded-full text-xs font-medium">
                  Professional
                </div>
                <div className="absolute -bottom-4 -left-4 bg-[#e9e2a3] text-[#333333] px-3 py-1 rounded-full text-xs font-medium">
                  Easy to Use
                </div>
              </div>

              {/* Right Column - Information */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#333333] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#333333] mb-2">Innovative Design Platform</h3>
                      <p className="text-sm text-[#666666] leading-relaxed">
                        Our cutting-edge design tool empowers you to create professional-grade custom uniforms and apparel. 
                        With intuitive drag-and-drop functionality, extensive template library, and real-time preview capabilities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#333333] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#333333] mb-2">Expert Support & Analysis</h3>
                      <p className="text-sm text-[#666666] leading-relaxed">
                        Get exclusive access to our design tool by contacting our expert team members. We provide personalized 
                        guidance, design analysis, and professional recommendations to ensure your vision comes to life perfectly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#333333] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#333333] mb-2">Seamless Order Process</h3>
                      <p className="text-sm text-[#666666] leading-relaxed">
                        Once your design is complete, submit it directly through our platform for instant analysis and quote. 
                        Our streamlined process ensures quick turnaround times and exceptional quality control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features Grid */}
            <div className="mt-12 md:mt-16">
              <h3 className="text-xl md:text-2xl font-bold text-[#333333] text-center mb-8">
                Powerful Features for Professional Results
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-[#e9e2a3] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#333333] mb-2">2d Preview</h4>
                  <p className="text-xs text-[#666666]">Visualize your design in  2d before ordering</p>
                </div>

                <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-[#e9e2a3] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#333333] mb-2">Brand Colors</h4>
                  <p className="text-xs text-[#666666]">Match your exact brand colors with precision</p>
                </div>

                <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-[#e9e2a3] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#333333] mb-2">Templates</h4>
                  <p className="text-xs text-[#666666]">Start with industry-specific design templates</p>
                </div>

                <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-[#e9e2a3] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#333333] mb-2">Expert Review</h4>
                  <p className="text-xs text-[#666666]">Get professional feedback on your designs</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 md:mt-16 text-center">
              <div className="bg-[#333333] rounded-2xl p-8 md:p-12 text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-4">
                  Ready to Create Your Custom Design?
                </h3>
                <p className="text-[#e9e2a3] mb-6 max-w-2xl mx-auto">
                  Contact our design specialists to get exclusive access to our professional design tool. 
                  Transform your brand vision into premium custom apparel with expert guidance every step of the way.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="bg-[#e9e2a3] text-[#333333] px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-300 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Contact Design Team
                  </button>
                  
                  <div className="flex items-center text-sm text-[#e9e2a3]">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Exclusive Access Required
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
