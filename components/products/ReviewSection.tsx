"use client";

import { useState, useEffect, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { StarIcon } from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";
import { Review } from "@/types/reviews";

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  onNewReview: (review: Review) => void;
}

export default function ReviewSection({
  productId,
  reviews,
  onNewReview,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserReview, setCurrentUserReview] = useState<Review | null>(
    null
  );
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Check if user has already reviewed
  useEffect(() => {
    async function checkUserReview() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const existingReview = reviews.find((r) => r.user_id === user.id);
        if (existingReview) {
          setCurrentUserReview(existingReview);
          if (isEditing) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
          }
        }
      }
    }
    checkUserReview();
  }, [reviews, supabase]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const reviewData = {
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
      };

      let result;
      if (currentUserReview && isEditing) {
        // Update existing review
        result = await supabase
          .from("reviews")
          .update(reviewData)
          .eq("id", currentUserReview.id)
          .select()
          .single();
      } else {
        // Insert new review
        result = await supabase
          .from("reviews")
          .insert([reviewData])
          .select()
          .single();
      }

      const { data: review, error } = result;

      if (error) {
        console.error("Error submitting review:", error);
        return;
      }

      if (review) {
        // Get user's profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        const fullReview = {
          ...review,
          user: {
            full_name: profileData?.full_name || "Anonymous User",
          },
        };

        onNewReview(fullReview);
        setComment("");
        setRating(5);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageRating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-medium">
              {averageRating} out of 5
            </span>
            <span className="text-gray-500">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {currentUserReview && !isEditing ? (
        <div className="mb-8">
          <p className="mb-4">You have already reviewed this product</p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit Your Review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitReview} className="mb-8">
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

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading
              ? "Submitting..."
              : isEditing
              ? "Update Review"
              : "Submit Review"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setRating(5);
                setComment("");
              }}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">
                  {review.user?.full_name || "Anonymous User"}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
