"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription for:", email);
    setEmail("");
  };

  return (
    <section className="bg-[#333333] py-8 sm:py-12 lg:py-16 rounded-lg">
      <div className="container mx-auto px-4 text-center">
        {/* Responsive heading */}
        <h2 className="mb-3 text-xl font-bold text-white  sm:mb-4 sm:text-2xl lg:text-3xl">
          Stay Updated
        </h2>
        
        {/* Responsive description */}
        <p className="mb-6 text-sm text-[#e9e2a3] sm:mb-8 sm:text-base lg:mb-10 lg:text-lg">
          Subscribe to our newsletter for the latest products and offers
        </p>
        
        {/* Responsive form container */}
        <div className="mx-auto max-w-xs sm:max-w-md lg:max-w-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-md border-2 border-[#6C6F7D] bg-white p-3 text-sm text-[#2E3138] placeholder-[#6C6F7D] focus:border-[#2E3138] focus:outline-none focus:ring-2 focus:ring-[#2E3138]/20 sm:p-2 sm:text-base"
              required
            />
            <button
              onClick={handleSubmit}
              className="max-w-20 text-center px-2 py-2 text-sm font-medium text-[#333333] bg-[#e9e2a3] border border-[#333333] rounded-md hover:bg-[#f8f6e1] transition-colors"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}