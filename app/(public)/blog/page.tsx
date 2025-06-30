import Link from "next/link";
import Image from "next/image";

// Demo blog data - replace with your actual data source
const blogPosts = [
  {
    id: 1,
    title: "The Future of Professional Uniforms: Trends Shaping 2025",
    excerpt: "Discover how sustainable materials, smart fabrics, and innovative designs are revolutionizing the uniform industry. From moisture-wicking technologies to eco-friendly production methods.",
    image: "/images/blog/uniform-trends-2025.jpg",
    fallbackColor: "from-blue-900 to-blue-700",
    category: "Industry Trends",
    author: "Sarah Johnson",
    date: "June 25, 2025",
    readTime: "5 min read",
    featured: true
  },
  {
    id: 2,
    title: "How to Choose the Perfect Chef Coat for Your Kitchen",
    excerpt: "A comprehensive guide to selecting chef coats that combine comfort, durability, and style. Learn about fabric choices, fit considerations, and maintenance tips.",
    image: "/images/blog/chef-coat-guide.jpg",
    fallbackColor: "from-orange-800 to-orange-600",
    category: "Buyer's Guide",
    author: "Michael Chen",
    date: "June 22, 2025",
    readTime: "7 min read",
    featured: false
  },
  {
    id: 3,
    title: "Corporate Uniform Psychology: Dressing for Success",
    excerpt: "Explore how the right corporate attire influences employee confidence, customer perception, and brand identity. Backed by psychological research and case studies.",
    image: "/images/blog/corporate-psychology.jpg",
    fallbackColor: "from-gray-800 to-gray-600",
    category: "Business Insights",
    author: "Dr. Emily Rodriguez",
    date: "June 20, 2025",
    readTime: "6 min read",
    featured: false
  },
  {
    id: 4,
    title: "Sustainable Uniforms: Our Commitment to the Environment",
    excerpt: "Learn about our eco-friendly manufacturing processes, sustainable materials, and how we're reducing our carbon footprint while maintaining quality standards.",
    image: "/images/blog/sustainable-uniforms.jpg",
    fallbackColor: "from-green-900 to-green-700",
    category: "Sustainability",
    author: "Alex Thompson",
    date: "June 18, 2025",
    readTime: "4 min read",
    featured: false
  },
  {
    id: 5,
    title: "Hospital Uniform Innovations: Safety Meets Comfort",
    excerpt: "Discover the latest innovations in medical uniforms, including antimicrobial treatments, ergonomic designs, and advanced fabric technologies for healthcare professionals.",
    image: "/images/blog/medical-innovations.jpg",
    fallbackColor: "from-cyan-800 to-cyan-600",
    category: "Healthcare",
    author: "Dr. James Wilson",
    date: "June 15, 2025",
    readTime: "8 min read",
    featured: false
  },
  {
    id: 6,
    title: "Custom Embroidery vs. Heat Transfer: Which is Right for You?",
    excerpt: "Compare different customization methods for your uniforms. We break down the pros, cons, durability, and cost considerations of each approach.",
    image: "/images/blog/customization-methods.jpg",
    fallbackColor: "from-purple-900 to-purple-700",
    category: "Customization",
    author: "Lisa Park",
    date: "June 12, 2025",
    readTime: "5 min read",
    featured: false
  }
];

export default function BlogSection() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <section className="container mx-auto px-4 py-5 md:py-8">
      <div className="mx-auto max-w-4xl text-center mb-8 md:mb-12">
        <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
          Insights & Stories from the Industry
        </h2>
        <p className="mb-8 md:mb-12 text-base md:text-lg leading-relaxed text-[#555555]">
          Stay updated with the latest trends, tips, and insights from the world of professional uniforms and workwear. 
          Our expert team shares valuable knowledge to help you make informed decisions.
        </p>
      </div>

      {/* Featured Blog Post */}
      {featuredPost && (
        <div className="mb-8 md:mb-12">
          <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transition-all duration-500 hover:shadow-2xl">
            <Link href={`/blog/${featuredPost.id}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 h-auto lg:h-96">
                {/* Image Section */}
                <div className="relative overflow-hidden h-64 lg:h-full">
                  {featuredPost.image ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${featuredPost.image})` }}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${featuredPost.fallbackColor} transform group-hover:scale-110 transition-transform duration-700`}></div>
                  )}
                  
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-500"></div>
                  
                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-[#e9e2a3] text-[#333333] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                      Featured
                    </span>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 md:p-8 flex flex-col justify-center bg-white">
                  <div className="mb-3">
                    <span className="inline-block bg-[#333333] text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                      {featuredPost.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-[#333333] mb-3 group-hover:text-[#555555] transition-colors duration-300">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-[#666666] mb-4 text-sm md:text-base leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-[#888888] mt-auto">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{featuredPost.author}</span>
                      <span>•</span>
                      <span>{featuredPost.date}</span>
                    </div>
                    <span className="font-medium">{featuredPost.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Regular Blog Posts Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8 md:mb-12">
        {regularPosts.map((post) => (
          <div key={post.id} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <Link href={`/blog/${post.id}`}>
              <div className="bg-white">
                {/* Image Section */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  {post.image ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${post.image})` }}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${post.fallbackColor} transform group-hover:scale-110 transition-transform duration-700`}></div>
                  )}
                  
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-500"></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-white bg-opacity-90 text-[#333333] px-2 py-1 rounded text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-[#333333] mb-2 group-hover:text-[#555555] transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-[#666666] mb-3 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-[#888888] pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{post.author}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                    <span className="font-medium">{post.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* View All Blog Posts Button */}
      <div className="flex justify-center">
        <Link
          href="/blog"
          className="inline-flex items-center px-8 py-3 bg-[#333333] text-white font-medium rounded-md hover:bg-[#555555] transition-colors duration-300"
        >
          View All Articles
          <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}