"use client";

import { useState } from "react";
import Link from "next/link";

export default function TopNavbar() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality here
    console.log("Searching for:", searchQuery);
    // You can redirect to search results page or trigger search
    // For example: router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Desktop Version - Hidden on mobile */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left side - Contact Info */}
          <div className="flex items-center space-x-6">
            {/* Phone */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg 
                className="h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                />
              </svg>
              <a 
                href="tel:18004523331" 
                className="hover:text-blue-600 transition-colors"
              >
                1 800 452 3331
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg 
                className="h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" 
                />
              </svg>
              <a 
                href="mailto:CUSTOMERSERVICE@TOPHATIW.COM" 
                className="hover:text-blue-600 transition-colors"
              >
                CUSTOMERSERVICE@TOPHATIW.COM
              </a>
            </div>
          </div>

          {/* Right side - Portfolio and Search */}
          <div className="flex items-center space-x-4">
            {/* Portfolio Link */}
            <Link 
              href="/portfolio" 
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span>+</span>
              <span>PORTFOLIO</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg 
                    className="h-4 w-4 text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Version - Hidden on desktop */}
      <div className="lg:hidden border-t border-gray-200 px-4 py-2">
        <div className="flex flex-col space-y-2">
          {/* Mobile Contact Info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <a href="tel:18004523331" className="flex items-center space-x-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>1 800 452 3331</span>
            </a>
            
            
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Mobile Email */}
          <div className="text-xs text-gray-600">
            <a href="mailto:CUSTOMERSERVICE@TOPHATIW.COM" className="flex items-center space-x-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>CUSTOMERSERVICE@TOPHATIW.COM</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}