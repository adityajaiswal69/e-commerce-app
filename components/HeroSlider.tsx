"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Define slider images for each category
const SLIDER_IMAGES = [
  {
    id: 1,
    src: "/images/hero/hotel.jpg",
    alt: "Hotel & Hospitality ",
    category: "hotel-hospitality",
    title: "Hotel & Hospitality",
    description: "Elegant uniforms for exceptional service"
  },
  {
    id: 2,
    src: "/images/hero/school2.jpg",
    alt: "School ",
    category: "school",
    title: "School/ Institution",
    description: "Quality uniforms for educational excellence"
  },
  {
    id: 3,
    src: "/images/hero/hospital-uniform.jpeg",
    alt: "Hospital Uniforms",
    category: "hospital-uniform",
    title: "Hospital Wear",
    description: "Professional attire for healthcare heroes"
  },
  {
    id: 4,
    src: "/images/hero/corporate.jpg",
    alt: "Corporate ",
    category: "corporate",
    title: "Corporate Wear",
    description: "Sophisticated uniforms for business professionals"
  },
  {
    id: 5,
    src: "/images/hero/restaurant.jpg",
    alt: "Cafes and Pubs Uniforms",
    category: "restaurant-cafe-pub",
    title: "Cafes/Restaurants/Pubs",
    description: "Trendy and functional uniforms for food & beverage outlets."
  },
  {
    id: 6,
    src: "/images/hero/casino.png",
    alt: "Casino Wear",
    category: "casino",
    title: "Casino Wear",
    description: "Stylish Sophisticated uniforms for Casino"
  },
  {
    id: 7,
    src: "/images/hero/apron.png",
    alt: "Designer Aprons",
    category: "designer-apron",
    title: "Designer Apron",
    description: "Stylish aprons for creative professionals."
  },
   {
    id: 8,
    src: "/images/hero/automobile.png",
    alt: "Automobile Uniforms",
    category: "automobile",
    title: "Automobile",
    description: "Functional and durable uniforms for automotive workers."
  },
  {
  id: 9,
  src: "/images/hero/chef.png",
  alt: "Chef Uniforms",
  category: "chef",
  title: "Chef Wear",
  description: "Professional and stylish uniforms for chefs and kitchen staff."
  }
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLogoIntro, setShowLogoIntro] = useState(true);
  const [startSlider, setStartSlider] = useState(false);
  
  // Logo intro sequence
  useEffect(() => {
    const logoIntroTimer = setTimeout(() => {
      setShowLogoIntro(false);
      // Small delay before starting the slider
      setTimeout(() => {
        setStartSlider(true);
      }, 500);
    }, 3000); // Show logo intro for 3 seconds

    return () => clearTimeout(logoIntroTimer);
  }, []);

  // Auto-advance the slider (only after intro is done)
  useEffect(() => {
    if (!startSlider) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === SLIDER_IMAGES.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [startSlider]);
  
  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden">
      
      {/* Logo Intro Screen */}
      <AnimatePresence>
        {showLogoIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-black z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                delay: 0.3
              }}
              className="text-center"
            >
              <Image
                src="/Logo-3.jpg"
                alt="Uniformat Logo"
                width={400}
                height={150}
                className="mx-auto bg-[#e9e2a3]/95 p-4 rounded-lg shadow-2xl"
                priority
              />
              
              {/* Optional: Add a subtle loading indicator or brand text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="mt-6"
              >
                <div className="flex justify-center space-x-1">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: 0
                    }}
                    className="w-2 h-2 bg-[#e9e2a3] rounded-full"
                  />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: 0.2
                    }}
                    className="w-2 h-2 bg-[#e9e2a3] rounded-full"
                  />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: 0.4
                    }}
                    className="w-2 h-2 bg-[#e9e2a3] rounded-full"
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Slider (shown after logo intro) */}
      <AnimatePresence>
        {startSlider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background overlay for text readability */}
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            
            {/* Slider images */}
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
                    priority={index === 0 || index === 1}
                    loading={index < 2 ? "eager" : "lazy"}
                    sizes="100vw"
                    quality={90}
                  />
                </div>
              ))}
            </div>
            
            {/* Content overlay */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
              <motion.h1 
                key={`title-${currentIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4 md:mb-6 text-4xl font-bold text-white md:text-6xl lg:text-7xl drop-shadow-lg"
              >
                {SLIDER_IMAGES[currentIndex].title}
              </motion.h1>
              
              <motion.p 
                key={`desc-${currentIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-8 md:mb-10 text-xl text-white md:text-2xl lg:text-3xl max-w-3xl drop-shadow-md"
              >
                {SLIDER_IMAGES[currentIndex].description}
              </motion.p>
              
              {/* Optional: Action buttons */}
              {/* <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-6 sm:space-y-0"
              >
                <Link
                  href={`/${SLIDER_IMAGES[currentIndex].category}`}
                  className="inline-block rounded-lg bg-[#e9e2a3] px-8 py-4 text-lg font-semibold text-[#333333] transition-all hover:bg-[#f8f6e1] hover:shadow-xl transform hover:scale-105"
                >
                  Shop {SLIDER_IMAGES[currentIndex].title}
                </Link>
                
                <Link
                  href="/products"
                  className="inline-block rounded-lg bg-[#333333] px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-[#222222] hover:shadow-xl transform hover:scale-105"
                >
                  Browse All Products
                </Link>
              </motion.div> */}
            </div>
            
            {/* Slider navigation dots */}
            <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
              {SLIDER_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "bg-[#e9e2a3] w-8 shadow-lg" 
                      : "bg-white/60 hover:bg-white/90 w-3"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}