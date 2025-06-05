"use client";

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import TestimonialCard from '../elements/TestimonialCard';

const TESTIMONIALS = [
  {
    id: 1,
    quote: "Working with this team was an absolute game-changer for our business. Their attention to detail and creative approach exceeded our expectations.",
    author: "Sarah Johnson",
    role: "Marketing Director",
    company: "Horizon Hotels",
    image: "/images/testimonials/person1.jpg"
  },
  {
    id: 2,
    quote: "The website they delivered perfectly captures our brand's essence. The user experience is seamless, and we've seen a significant increase in engagement.",
    author: "Michael Chen",
    role: "CEO",
    company: "AutoElite",
    image: "/images/testimonials/person2.jpg"
  },
  {
    id: 3,
    quote: "Professional, responsive, and incredibly talented. They transformed our outdated site into a modern, high-performing digital asset that truly represents our brand.",
    author: "Emily Rodriguez",
    role: "Operations Manager",
    company: "MediCare Solutions",
    image: "/images/testimonials/person3.jpg"
  },
  {
    id: 4,
    quote: "Their strategic approach to design and development helped us stand out in a competitive market. The results have been outstanding.",
    author: "David Kim",
    role: "Founder",
    company: "EduFuture Academy",
    image: "/images/testimonials/person4.jpg"
  }
];

const Testimonials: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto slide settings
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => 
        prev === Math.ceil(TESTIMONIALS.length / 2) - 1 ? 0 : prev + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPaused]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    beforeChange: (current: number, next: number) => setCurrentSlide(next),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    customPaging: (i: number) => (
      <div 
        className={`h-1.5 rounded-full mx-1 transition-all duration-300 ${i === currentSlide ? 'w-6 bg-[#e9e2a3]' : 'w-2 bg-gray-300'}`}
      />
    ),
    appendDots: (dots: React.ReactNode) => (
      <div className="mt-8">
        <ul className="flex justify-center">{dots}</ul>
      </div>
    ),
  };

  return (
    <section className="py-5 md:py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-[#333333] mb-4">
            What Our Clients Say
          </h2>
          <p className="text-[#6c6f7d] max-w-2xl mx-auto">
            Hear from businesses that have transformed their online presence with our solutions
          </p>
        </div>

        <div className="relative">
          <Slider {...settings} className="testimonial-slider">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.id} className="px-3">
                <TestimonialCard
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  company={testimonial.company}
                  image={testimonial.image}
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
