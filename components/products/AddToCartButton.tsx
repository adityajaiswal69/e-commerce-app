"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";

type AddToCartButtonProps = {
  productId: string;
  price: number;
  selectedSize?: string;
  category: string;
  name: string;
  image_url: string;
};

export default function AddToCartButton({
  productId,
  price,
  selectedSize,
  category,
  name,
  image_url,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    setLoading(true);
    try {
      await addItem({
        productId,
        quantity: 1,
        price,
        size: selectedSize,
        category,
        name,
        image_url,
      });
      router.refresh();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || !selectedSize}
      className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
