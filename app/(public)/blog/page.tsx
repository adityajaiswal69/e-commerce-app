"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { BlogPost } from "@/types/blog";

export default function BlogSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  // use the singleton supabase client
  
  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);
  
  // Calculate pagination
  const totalPages = Math.ceil(regularPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = regularPosts.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('blog-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-5 md:py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#333333]"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog-section" className="container mx-auto px-4 py-5 md:py-8">
      <div className="mx-auto max-w-4xl text-center mb-8 md:mb-12">
        <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
          Insights & Stories from the Industry
        </h2>
        <p className="mb-8 md:mb-12 text-base md:text-lg leading-relaxed text-[#555555]">
          Stay updated with the latest trends, tips, and insights from the world of professional uniforms and workwear. 
          Our expert team shares valuable knowledge to help you make informed decisions.
        </p>
      </div>

      {/* Featured Blog Post - Only show on first page */}
      {featuredPost && currentPage === 1 && (
        <div className="mb-8 md:mb-12">
          <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transition-all duration-500 hover:shadow-2xl">
            <Link href={`/blog/${featuredPost.id}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 h-auto lg:h-96">
                {/* Image Section */}
                <div className="relative overflow-hidden h-64 lg:h-full">
                  {featuredPost.image_url ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${featuredPost.image_url})` }}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${featuredPost.fallback_color} transform group-hover:scale-110 transition-transform duration-700`}></div>
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
                    <span className="font-medium">{featuredPost.read_time}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Regular Blog Posts Grid */}
      {currentPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {currentPosts.map((post) => (
            <div key={post.id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
              <Link href={`/blog/${post.id}`}>
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  {post.image_url ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${post.image_url})` }}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${post.fallback_color} transform group-hover:scale-110 transition-transform duration-700`}></div>
                  )}
                  
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-500"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white text-[#333333] px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#333333] mb-2 group-hover:text-[#555555] transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-[#666666] mb-4 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-[#888888] mt-auto">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{post.author}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                    <span className="font-medium">{post.read_time}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* No Posts Message */}
      {blogPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-[#666666] text-lg">
            No blog posts available at the moment. Check back soon for new content!
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-[#333333] border border-gray-300 hover:bg-[#333333] hover:text-white hover:border-[#333333]'
            }`}
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-4 py-2 text-[#666666]">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-[#333333] text-white'
                      : 'bg-white text-[#333333] border border-gray-300 hover:bg-[#333333] hover:text-white hover:border-[#333333]'
                  }`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
          
          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-[#333333] border border-gray-300 hover:bg-[#333333] hover:text-white hover:border-[#333333]'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}