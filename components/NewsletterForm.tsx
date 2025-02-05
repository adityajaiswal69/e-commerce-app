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
    <section className="bg-blue-50 py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-2xl font-bold">Stay Updated</h2>
        <p className="mb-8 text-gray-600">
          Subscribe to our newsletter for the latest products and offers
        </p>
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-md border p-2"
            required
          />
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
