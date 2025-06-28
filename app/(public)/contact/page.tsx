"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, User, Building2 } from 'lucide-react';

const contactInfo = [
  {
    icon: <Phone className="w-6 h-6 text-[#e9e2a3]" />,
    title: "Phone",
    details: ["+91 98765 43210", "+91 87654 32109"],
    description: "Call us during business hours"
  },
  {
    icon: <Mail className="w-6 h-6 text-[#e9e2a3]" />,
    title: "Email",
    details: ["info@Uniformat.com", "sales@Uniformat.com"],
    description: "Get a response within 24 hours"
  },
  {
    icon: <MapPin className="w-6 h-6 text-[#e9e2a3]" />,
    title: "Location",
    details: ["123 Business District", "Mumbai, Maharashtra 400001"],
    description: "Visit our manufacturing facility"
  },
  {
    icon: <Clock className="w-6 h-6 text-[#e9e2a3]" />,
    title: "Business Hours",
    details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 9:00 AM - 2:00 PM"],
    description: "Sunday closed"
  }
];

const services = [
  "Custom Uniform Design",
  "Bulk Manufacturing",
  "Branding & Embroidery",
  "Quality Consultation",
  "Fitting Services",
  "After-sales Support"
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      service: '',
      message: ''
    });
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <div className="space-y-8 sm:space-y-12 md:space-y-16 py-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#333333] to-[#555555] text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-[#e9e2a3] leading-relaxed max-w-3xl mx-auto">
              Ready to transform your brand identity? Let's discuss your uniform needs 
              and create something extraordinary together.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="container mx-auto px-4 py-5 md:py-8">
        <div className="mx-auto max-w-4xl text-center mb-8 md:mb-12">
          <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
            Get in Touch
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555555]">
            Multiple ways to reach us. Choose what works best for you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {contactInfo.map((info, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 md:p-8 text-center transition-all duration-500 hover:scale-105 border-t-4 border-[#e9e2a3]">
                <div className="flex justify-center">
                  <div className="rounded-full p-3 bg-[#333333] mb-4">
                    {info.icon}
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#333333] mb-3">
                  {info.title}
                </h3>
                <div className="space-y-1 mb-2">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-sm md:text-base text-[#555555] font-medium">
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="text-xs md:text-sm text-[#666666]">
                  {info.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & Services Section */}
      <section className="bg-[#f8f6e1] px-4 py-8 md:py-12">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="w-6 h-6 text-[#333333]" />
                  <h3 className="text-xl md:text-2xl font-bold text-[#333333]">
                    Send us a Message
                  </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#e9e2a3] focus:border-[#e9e2a3] transition-colors duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#e9e2a3] focus:border-[#e9e2a3] transition-colors duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#e9e2a3] focus:border-[#e9e2a3] transition-colors duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333333] mb-2">
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#e9e2a3] focus:border-[#e9e2a3] transition-colors duration-300"
                        placeholder="Enter your company name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Service Interest
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#e9e2a3] focus:border-[#e9e2a3] transition-colors duration-300"
                    >
                      <option value="">Select a service</option>
                      {services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#e9e2a3] focus:border-[#e9e2a3] transition-colors duration-300 resize-vertical"
                      placeholder="Tell us about your uniform requirements..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-8 py-3 bg-[#333333] text-white font-medium rounded-md hover:bg-[#555555] transition-colors duration-300"
                  >
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Services & Additional Info */}
            <div className="flex-1">
              <div className="space-y-6">
                {/* Services List */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-[#333333] mb-6">
                    Our Services
                  </h3>
                  <div className="space-y-3">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center gap-3 group">
                        <div className="flex-shrink-0 w-2 h-2 bg-[#e9e2a3] rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                        <p className="text-base text-[#555555] group-hover:text-[#333333] transition-colors duration-300">
                          {service}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image */}
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/contact/contact-image.jpg"
                    alt="Uniformat contact"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-lg font-bold">Visit Our Showroom</h4>
                    <p className="text-sm opacity-90">Experience quality firsthand</p>
                  </div>
                </div>

                {/* Quick Contact */}
                <div className="bg-[#333333] rounded-xl shadow-lg p-6 md:p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Quick Response</h3>
                  <p className="text-[#e9e2a3] mb-4">
                    Need immediate assistance? Call us directly for urgent inquiries.
                  </p>
                  <div className="space-y-2">
                    <p className="font-medium">📞 +91 98765 43210</p>
                    <p className="text-sm opacity-90">Available Mon-Fri, 9 AM - 6 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {/* <section className="container mx-auto px-4 py-5 md:py-8">
        <div className="mx-auto max-w-4xl text-center mb-8 md:mb-12">
          <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
            Find Us Here
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555555]">
            Located in the heart of Mumbai's business district for easy access.
          </p>
        </div> */}
        
        {/* <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-xl"> */}
          {/* Placeholder for Google Maps - Replace with actual map integration */}
          {/* <div className="w-full h-full bg-gradient-to-br from-[#e9e2a3] to-[#f8f6e1] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-[#333333] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#333333] mb-2">Interactive Map</h3>
              <p className="text-[#555555]">Google Maps integration would go here</p>
              <p className="text-sm text-[#666666] mt-2">123 Business District, Mumbai, Maharashtra 400001</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className=" px-4 py-8 md:py-12">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 md:mb-6 text-2xl font-bold text-[#333333] md:text-3xl lg:text-4xl">
              Let's Create Something Amazing
            </h2>
            <p className="mb-6 md:mb-8 text-base md:text-lg leading-relaxed text-[#555555]">
              From concept to delivery, we're here to make your uniform vision a reality. 
              Experience the Uniformat difference today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/about">
                <button className="inline-flex items-center px-8 py-3 bg-[#333333] text-white font-medium rounded-md hover:bg-[#555555] transition-colors duration-300">
                   About Us
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </Link>
              <Link href="/">
                <button className="inline-flex items-center px-8 py-3 border-2 border-[#333333] text-[#333333] font-medium rounded-md hover:bg-[#333333] hover:text-white transition-all duration-300">
                  Browse Products
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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