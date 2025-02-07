"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number | null;
  product: {
    name: string;
    image_url: string;
  };
};

type Order = {
  id: string;
  created_at: string;
  total: number | null;
  status: string;
  order_items: OrderItem[];
};

type OrderHistoryProps = {
  orders: Order[];
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [itemReviews, setItemReviews] = useState<Record<string, Review | null>>(
    {}
  );
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchAllReviews() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const productIds = orders.flatMap((order) =>
        order.order_items.map((item) => item.product_id)
      );

      if (productIds.length) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("*")
          .eq("user_id", user.id)
          .in("product_id", productIds);

        const reviewMap = (reviews || []).reduce(
          (acc, review) => ({
            ...acc,
            [review.product_id]: review,
          }),
          {}
        );

        setItemReviews(reviewMap);
      }
    }

    fetchAllReviews();
  }, [orders, supabase]);

  const checkExistingReview = async (productId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: review } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .single();

    if (review) {
      setExistingReview(review);
      setRating(review.rating);
      setComment(review.comment);
    } else {
      setExistingReview(null);
      setRating(5);
      setComment("");
    }
  };

  const handleItemClick = async (item: OrderItem) => {
    setSelectedItem(item);
    await checkExistingReview(item.product_id);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (existingReview) {
        await supabase
          .from("reviews")
          .update({
            rating,
            comment,
          })
          .eq("id", existingReview.id);
      } else {
        await supabase.from("reviews").insert([
          {
            product_id: selectedItem.product_id,
            user_id: user.id,
            rating,
            comment,
          },
        ]);
      }

      await checkExistingReview(selectedItem.product_id);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!orders?.length) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <h2 className="mb-4 text-lg font-medium">Order History</h2>
        <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
        <Link
          href="/products"
          className="mt-4 inline-block text-blue-500 hover:text-blue-600"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Order History</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">Order #{order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${(order.total || 0).toFixed(2)}</p>
                <p className="text-sm capitalize text-gray-500">
                  {order.status}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × ${(item.price_at_time || 0).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleItemClick(item)}
                    className="ml-auto text-blue-500 hover:text-blue-600"
                  >
                    {itemReviews[item.product_id]
                      ? "Update Review"
                      : "Write Review"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {existingReview ? "Update Review" : "Write Review"} for{" "}
              {selectedItem.product.name}
            </h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-6 h-6 cursor-pointer ${
                        star <= rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading
                    ? "Submitting..."
                    : existingReview
                    ? "Update Review"
                    : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
