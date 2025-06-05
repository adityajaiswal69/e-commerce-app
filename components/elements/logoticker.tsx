"use client";
import React from "react";
import Marquee from "react-fast-marquee";
import Image from "next/image";

interface LogoItem {
  src: string;
  alt: string;
}

const logoItems: LogoItem[] = [
  { src: "/images/clientslogo/logo1.png", alt: "Client 1" },
  { src: "/images/clientslogo/logo2.png", alt: "Client 2" },
  { src: "/images/clientslogo/logo3.png", alt: "Client 3" },
  { src: "/images/clientslogo/logo4.png", alt: "Client 4" },
  { src: "/images/clientslogo/logo5.png", alt: "Client 5" },
  { src: "/images/clientslogo/logo6.png", alt: "Client 6" },
  { src: "/images/clientslogo/logo7.png", alt: "Client 7" },
  { src: "/images/clientslogo/logo8.png", alt: "Client 8" },
  { src: "/images/clientslogo/logo9.png", alt: "Client 9" },
  
];

const LogoTicker: React.FC = () => {
  return (
    <div className="py-5 md:py-8 bg-[#333333]">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Our Valued Clients
          </h2>
          <p className="text-[#e9e2a3] max-w-2xl mx-auto">
            Trusted by leading brands and organizations across various industries
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          
          
          <Marquee
            pauseOnHover={true}
            direction="left"
            speed={40}
            gradient={false}
            className="py-2"
          >
            {[...logoItems, ...logoItems].map((logo, index) => (
              <div 
                key={`${logo.alt}-${index}`} 
                className="mx-6 md:mx-10 flex items-center justify-center"
                style={{ minWidth: '120px' }}
              >
                <div className="relative h-12 w-24 md:h-16 md:w-32 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <Image 
                    src={logo.src} 
                    alt={logo.alt}
                    fill
                    sizes="(max-width: 768px) 120px, 160px"
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default LogoTicker;