"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Demo blog data - replace with your actual data source


export default function BlogSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);
  
  // Calculate pagination
  const totalPages = Math.ceil(regularPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = regularPosts.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of blog section
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
        {currentPosts.map((post) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4 mb-8 md:mb-12">
          {/* Page Info */}
          <div className="text-sm text-[#666666]">
            Showing {startIndex + 1}-{Math.min(endIndex, regularPosts.length)} of {regularPosts.length} articles
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#333333] border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-2 text-sm text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => {
                        if (typeof page === 'number') handlePageChange(page);
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-[#333333] text-white'
                          : 'bg-white text-[#333333] border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#333333] border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

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