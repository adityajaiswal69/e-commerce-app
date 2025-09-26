"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {  Eye, Shield, Target } from 'lucide-react';
const teamMembers = [
  {
    name: "Aarav Mehta",
    role: "Founder & CEO",
    image: "/images/team/aarav.jpg",
    bio: "Visionary leader with a passion for quality and innovation in uniform design.",
  },
 
  {
    name: "Rajesh Kumar",
    role: "Production Manager",
    image: "/images/team/rajesh.jpg",
    bio: "Ensures every garment meets our exacting standards of quality and craftsmanship.",
  },
  
];

const achievements = [
  {
    number: "500+",
    label: "Happy Clients",
    description: "Trusted by organizations across industries"
  },
  {
    number: "50,000+",
    label: "Uniforms Delivered",
    description: "Premium quality garments crafted with care"
  },
  {
    number: "15+",
    label: "Years Experience",
    description: "Decades of expertise in uniform manufacturing"
  },
  {
    number: "24/7",
    label: "Customer Support",
    description: "Always here when you need us"
  }
];

const values = [
  {
    icon: <Target className=" sm:w-5 sm:h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 text-bg-accent" />,
    title: "Our Mission",
    description: "To help organizations bring their brand to life through thoughtfully designed uniforms that combine comfort, durability, and timeless aesthetics."
  },
  {
    icon: <Eye className=" sm:w-5 sm:h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 text-bg-accent" />,
    title: "Our Vision", 
    description: "To be the leading provider of innovative, high-quality uniforms and branded apparel, empowering organizations to express their identity with confidence and pride."
  },
  {
    icon: <Shield className=" sm:w-5 sm:h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 text-bg-accent" />,
    title: "Our Strength",
    description: "A passionate team, premium materials, and a commitment to sustainability, innovation, quality, and client satisfaction set us apart in the industry."
  }
];

const whyChoosePoints = [
  "Industry expertise across hospitality, healthcare, education, and more",
  "Custom design and branding for a unique look",
  "Premium materials and superior craftsmanship", 
  "Sustainable and ethical production practices",
  "Personalized service from concept to delivery",
  "On-time delivery and reliable support"
];

export default function AboutPage() {
  return (
    <div className="space-y-8 sm:space-y-12 md:space-y-16 py-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-dark to-secondary-dark text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              About Uniformat
            </h1>
            <p className="text-lg md:text-xl text-bg-accent leading-relaxed max-w-3xl mx-auto">
              Crafting Identity with Every Stitch - Your trusted partner in premium uniforms
              and branded apparel for every industry.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="container mx-auto px-4 py-5 md:py-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-6">
              Tailored Solutions for Every Industry
            </h2>
            <div className="space-y-4 text-base md:text-lg text-text-secondary leading-relaxed">
              <p>
                The journey of <span className="font-semibold text-text-primary">Uniformat</span> began with a vision to redefine uniform design and production in India. Our pursuit of perfection and dedication to the craft laid the foundation for what would become a leading uniform manufacturing company.
              </p>
              <p>
                Our team brings together expertise in bespoke cutting, fitting, and pattern drafting, as well as skilled administration and strategic vision. Together, we are committed to delivering uniforms that meet the highest standards of <span className="font-semibold text-text-primary">quality, customization, comfort, and style</span>.
              </p>
              <p>
                Fuelled by passion and driven by a commitment to excellence, Uniformat provides complete uniform solutions to industries such as <span className="font-semibold text-text-primary">hospitality, healthcare, corporate, education, and aviation</span>. Our goal is clear: to help organizations express their identity with confidence and pride.
              </p>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/images/about/company-team.jpg"
                alt="Uniformat team presentation"
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Stats */}
      <section className="bg-gradient-to-br from-bg-light to-bg-light-end px-4 py-8 md:py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 group-hover:text-bg-accent transition-colors duration-300">
                    {achievement.number}
                  </h3>
                  <p className="text-sm md:text-base font-semibold text-text-secondary mb-1">
                    {achievement.label}
                  </p>
                  <p className="text-xs md:text-sm text-text-tertiary">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="container mx-auto px-4 py-5 md:py-8">
        <div className="mx-auto max-w-4xl text-center mb-8 md:mb-12">
          <h2 className="mb-4 md:mb-6 text-2xl font-bold text-text-primary md:text-3xl lg:text-4xl">
            Our Foundation
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-text-secondary">
            Built on strong values and a clear vision for the future of uniform manufacturing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {values.map((value, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 md:p-8 text-center transition-all duration-500 hover:scale-105 border-t-4 border-bg-accent" >
                <div className="flex justify-center">
                    <div className="rounded-full p-2 bg-primary-dark mb-2">
                        {value.icon}
                    </div>
                  
                </div>
                <h3 className="text-lg md:text-xl font-bold text-text-primary mb-3">
                  {value.title}
                </h3>
                <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-bg-dark px-4 py-8 md:py-12 text-white">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl text-center mb-8 md:mb-12">
            <h2 className="mb-4 md:mb-6 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
              Meet Our Expert Team
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-bg-accent">
              The passionate professionals behind Uniformat's success story.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4 md:p-6 text-center">
                    <h3 className="text-lg md:text-xl font-bold text-text-primary mb-1">
                      {member.name}
                    </h3>
                    <p className="text-bg-accent font-medium mb-2 text-sm md:text-base">
                      {member.role}
                    </p>
                    <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto px-4 py-5 md:py-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-4">
              Why Choose Us<br />
              <span className="block text-bg-accent">for Your Brand?</span>
            </h2>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed">
              We bring together industry expertise, premium materials, and personalized service
              to deliver uniforms that truly represent your brand.
            </p>
          </div>
          <div className="flex-1">
            <div className="space-y-3 md:space-y-4">
              {whyChoosePoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-2 h-2 bg-bg-accent rounded-full mt-3 group-hover:scale-150 transition-transform duration-300"></div>
                  <p className="text-base md:text-lg text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors duration-300">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-bg-light to-bg-light-end px-4 py-8 md:py-12">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 md:mb-6 text-2xl font-bold text-text-primary md:text-3xl lg:text-4xl">
              Ready to Elevate Your Brand?
            </h2>
            <p className="mb-6 md:mb-8 text-base md:text-lg leading-relaxed text-text-secondary">
              Let's work together to create uniforms that perfectly represent your organization's
              identity and values. Contact us today for a consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
              <button className="inline-flex items-center px-8 py-3 bg-primary-dark text-white font-medium rounded-md hover:bg-secondary-dark transition-colors duration-300">
                Contact Now
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              </Link>
              <Link href="/">
              <button className="inline-flex items-center px-8 py-3 border-2 border-primary-dark text-text-primary font-medium rounded-md hover:bg-primary-dark hover:text-white transition-all duration-300">
                Go to Store
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}