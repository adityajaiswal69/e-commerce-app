"use client";

import { useState, useRef, useEffect } from "react";
import { Product } from "@/types/database.types";
import ProductCard from "./ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

type BestSellingProductsProps = {
  products: Product[];
};

// Main categories for filtering
const CATEGORIES = [
  { id: "all", name: "All Products" },
  { id: "hotel-hospitality", name: "Hotel/Hospitality" },
  { id: "hospital-uniform", name: "Hospital" },
  { id: "corporate", name: "Corporate" },
  { id: "school", name: "School" },
  { id: "restaurant-cafe-pub", name: "Restaurant" },
  { id: "fashion", name: "Fashion" },
];

export default function BestSellingProducts({ products }: BestSellingProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProducts(products);
    } else {
      // Filter products that start with the selected category
      // This handles both direct categories and category/subcategory format
      const filtered = products.filter(product => 
        product.category === selectedCategory || 
        product.category.startsWith(`${selectedCategory}/`)
      );
      setFilteredProducts(filtered);
    }
    
    // Reset scroll position when category changes
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      checkScrollButtons();
    }
  }, [selectedCategory, products]);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="container px-5 py-2 md:py-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#333333] flex items-center">
          Best <span className="text-[#bfb875] ml-2">Selling</span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border border-gray-200 ${
              canScrollLeft ? "text-[#333333] hover:bg-[#f8f6e1]" : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border border-gray-200 ${
              canScrollRight ? "text-[#333333] hover:bg-[#f8f6e1]" : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-md transition-all duration-300 ${selectedCategory === category.id 
              ? 'bg-[#e9e2a3] text-[#333333] font-medium shadow-sm' 
              : 'bg-[#f8f6e1] text-[#555555] hover:bg-[#e9e2a3] hover:text-[#333333]'}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <div 
            ref={scrollRef} 
            className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar"
            onScroll={checkScrollButtons}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <motion.div 
                  key={product.id} 
                  className="min-w-[250px] md:min-w-[280px] flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="w-full py-6 text-center text-[#555555]">
                <p>No products found in this category.</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
