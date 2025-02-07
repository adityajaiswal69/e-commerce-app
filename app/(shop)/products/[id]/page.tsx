"use client";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect, use } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ReviewSection from "@/components/products/ReviewSection";
import { Review } from "@/types/reviews";
import AddToCartButton from "@/components/products/AddToCartButton";

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
  style?: string[];
  colors?: string[];
  sizes?: Record<string, string[]>;
  occasions?: string[];
}

type SizeCategory = "top" | "bottom" | "shoes";

function getSizeCategory(category: string): SizeCategory | null {
  const categoryMap: Record<string, SizeCategory> = {
    tshirt: "top",
    shirt: "top",
    jacket: "top",
    pants: "bottom",
    jeans: "bottom",
    shorts: "bottom",
    shoes: "shoes",
    sneakers: "shoes",
    boots: "shoes",
  };

  return categoryMap[category.toLowerCase()] || null;
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClientComponentClient();

      // Fetch product
      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!productData) {
        notFound();
      }
      setProduct(productData);

      // Fetch reviews with user info
      const { data: reviewsData, error: reviewError } = await supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          product_id,
          user_id,
          user:profiles!user_id (
            full_name
          )
        `
        )
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (reviewError) {
        console.error("Error fetching reviews:", reviewError);
      }

      console.log("Fetched reviews:", reviewsData); // For debugging
      setReviews(reviewsData || []);
    }

    fetchData();
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
        <div className="relative aspect-square">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-2xl font-semibold text-blue-600">
              ${product.price.toFixed(2)}
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">{product.description}</p>
            <div className="space-y-2">
              {product.style?.length > 0 && (
                <div>
                  <h3 className="font-medium">Style:</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.style.map((style) => (
                      <span
                        key={style}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.colors?.length > 0 && (
                <div>
                  <h3 className="font-medium">Colors:</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.sizes && (
                <div>
                  <h3 className="font-medium">Select Size:</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(() => {
                      const sizeCategory = getSizeCategory(product.category);
                      if (!sizeCategory || !product.sizes[sizeCategory]) {
                        return null;
                      }
                      return product.sizes[sizeCategory].map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border rounded-md ${
                            selectedSize === size
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
              {product.occasions?.length > 0 && (
                <div>
                  <h3 className="font-medium">Perfect for:</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.occasions.map((occasion) => (
                      <span
                        key={occasion}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {occasion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="pt-4">
              <AddToCartButton
                productId={product.id}
                price={product.price}
                selectedSize={selectedSize}
                category={product.category}
                name={product.name}
                image_url={product.image_url}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <ReviewSection
          productId={id}
          reviews={reviews}
          onNewReview={(review) => {
            // Replace existing review if it exists, otherwise add new one
            setReviews((prev) => {
              const index = prev.findIndex((r) => r.id === review.id);
              if (index !== -1) {
                const newReviews = [...prev];
                newReviews[index] = review;
                return newReviews;
              }
              return [review, ...prev];
            });
          }}
        />
      </div>
    </div>
  );
}
