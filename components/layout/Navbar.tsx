"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to products page with search query
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear search after submitting
    }
  };

  return (
    <div>
      {/* Desktop Version - Only visible on medium screens and up */}
      <div className="hidden md:block bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-7 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Left side - Contact Info */}
            <div className="flex items-center space-x-6">
              {/* Phone */}
              <div className="flex items-center space-x-2 text-sm text-[#555555]">
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
                  href="tel:00000000" 
                  className="hover:text-[#e9e2a3] transition-colors"
                >
                  000000 0000 000
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-2 text-sm text-[#555555]">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
                <a 
                  href="mailto:CUSTOMERSERVICE@TOPHATIW.COM" 
                  className="hover:text-[#e9e2a3] transition-colors"
                >
                  CUSTOMERSERVICE@UNIFORMAT.COM
                </a>
              </div>
            </div>

            {/* Right side - Portfolio and Search */}
            <div className="flex items-center space-x-4">
              {/* Portfolio Link */}
              {/* <Link 
                href="/portfolio" 
                className="flex items-center space-x-1 text-sm text-[#555555] hover:text-[#333333] transition-colors"
              >
                <span>+</span>
                <span>PORTFOLIO</span>
              </Link> */}

              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center">
                <input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search products..."
  className="w-full  md:w-80 lg:w-96 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e9e2a3] focus:border-transparent"
/>
                  <button
                    type="submit"
                    className="absolute right-2 p-1 hover:bg-[#f8f6e1] rounded-md transition-colors"
                  >
                    <svg 
                      className="h-4 w-4 text-[#333333]" 
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
      </div>
    </div>
  );
}