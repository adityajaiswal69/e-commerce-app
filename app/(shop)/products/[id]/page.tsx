"use client";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect, use } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  stock: number;
  created_at: string;
  active: boolean;
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  // This is a temporary solution until we figure out data fetching in client components
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClientComponentClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        notFound();
      }

      setProduct(data);
    }

    fetchProduct();
  }, [id]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const handleAddToCart = () => {
    setLoading(true);
    try {
      addItem(product);
      // Optional: Show success message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square relative overflow-hidden rounded-lg">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-lg text-gray-500">{product.category}</p>
          <p className="mt-4 text-2xl font-bold">${product.price.toFixed(2)}</p>
          <p className="mt-4 text-gray-600">{product.description}</p>
          <div className="mt-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || loading}
              className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
            >
              {loading
                ? "Adding..."
                : product.stock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
