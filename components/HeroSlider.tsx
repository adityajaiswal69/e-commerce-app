"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Define slider images for each category
const SLIDER_IMAGES = [
  {
    id: 1,
    src: "/images/hero/hotel-hospitality.jpg",
    alt: "Hotel & Hospitality Uniforms",
    category: "hotel-hospitality",
    title: "Hotel & Hospitality",
    description: "Elegant uniforms for exceptional service"
  },
  {
    id: 2,
    src: "/images/hero/school.jpg",
    alt: "School Uniforms",
    category: "school",
    title: "School Uniforms",
    description: "Quality uniforms for educational excellence"
  },
  {
    id: 3,
    src: "/images/hero/hospital-uniform.jpg",
    alt: "Hospital Uniforms",
    category: "hospital-uniform",
    title: "Hospital Uniforms",
    description: "Professional attire for healthcare heroes"
  },
  {
    id: 4,
    src: "/images/hero/corporate.jpg",
    alt: "Corporate Uniforms",
    category: "corporate",
    title: "Corporate Wear",
    description: "Sophisticated uniforms for business professionals"
  },
  {
    id: 5,
    src: "/images/hero/restaurant.jpg",
    alt: "Restaurant Uniforms",
    category: "restaurant-cafe-pub",
    title: "Restaurant & Café",
    description: "Stylish uniforms for hospitality excellence"
  }
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-advance the slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === SLIDER_IMAGES.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden">
      {/* Background overlay for text readability */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      {/* Slider images - Using a better approach to prevent flashes */}
      <div className="absolute inset-0">
        {SLIDER_IMAGES.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ zIndex: index === currentIndex ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={index === 0 || index === 1} // Only prioritize first two images
              loading={index < 2 ? "eager" : "lazy"}
              sizes="100vw"
              quality={90}
            />
          </div>
        ))}
      </div>
      
      {/* Content overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="mx-auto mb-6 md:mb-8 max-w-xs">
          <Image 
            src="/Logo-3.jpg" 
            alt="Uniformat Logo" 
            width={300} 
            height={100} 
            className="mx-auto w-48 md:w-auto bg-[#e9e2a3]/90 p-2 rounded-md"
            priority
          />
        </div>
        
        <motion.h1 
          key={`title-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-3 md:mb-4 text-3xl font-bold text-white md:text-5xl lg:text-6xl"
        >
          {SLIDER_IMAGES[currentIndex].title}
        </motion.h1>
        
        <motion.p 
          key={`desc-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8 md:mb-10 text-lg text-white md:text-2xl max-w-2xl"
        >
          {SLIDER_IMAGES[currentIndex].description}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-6 sm:space-y-0"
        >
          <Link
            href={`/${SLIDER_IMAGES[currentIndex].category}`}
            className="inline-block rounded-md bg-[#e9e2a3] px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-medium text-[#333333] transition-all hover:bg-[#f8f6e1] hover:shadow-lg"
          >
            Shop {SLIDER_IMAGES[currentIndex].title}
          </Link>
          
          <Link
            href="/products"
            className="inline-block rounded-md bg-[#333333] px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-medium text-white transition-all hover:bg-[#222222] hover:shadow-lg"
          >
            Browse All Products
          </Link>
        </motion.div>
      </div>
      
      {/* Slider navigation dots */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
        {SLIDER_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? "bg-[#e9e2a3] w-6" 
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
