"use client";

import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

export default function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  // Helper function to create URL with updated page parameter
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // Add all existing search parameters except page
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        params.set(key, value);
      }
    });
    
    // Add the new page parameter
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    const queryString = params.toString();
    return `/products${queryString ? `?${queryString}` : ''}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let start = Math.max(currentPage - 1, 2);
      let end = Math.min(currentPage + 1, totalPages - 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        start = 2;
        end = 4;
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }
      
      // Add ellipsis if there's a gap
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if there's a gap
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <Link
        href={createPageUrl(currentPage - 1)}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
        aria-disabled={currentPage === 1}
      >
        <ChevronLeftIcon className="w-4 h-4 mr-1" />
        Previous
      </Link>

      {/* Page Numbers */}
      <div className="flex space-x-1">
        {pageNumbers.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            ) : (
              <Link
                href={createPageUrl(page as number)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <Link
        href={createPageUrl(currentPage + 1)}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
        aria-disabled={currentPage === totalPages}
      >
        Next
        <ChevronRightIcon className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
}