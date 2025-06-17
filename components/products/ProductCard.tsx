"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/database.types";
import { StarIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  useEffect(() => {
    const fetchRating = async () => {
      const supabase = createClientComponentClient();
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", product.id);

      if (reviews?.length) {
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating(Number((total / reviews.length).toFixed(1)));
        setReviewCount(reviews.length);
      }
    };

    fetchRating();
  }, [product.id]);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-lg border p-4 transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square relative overflow-hidden rounded-lg">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        <div className="mt-1 flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-4 h-4 ${
                  star <= averageRating ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          {reviewCount > 0 && (
            <span className="text-sm text-gray-500">({reviewCount})</span>
          )}
        </div>
        <p className="mt-2 text-lg font-bold">₹{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
