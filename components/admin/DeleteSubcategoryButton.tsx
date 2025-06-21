"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FiTrash2 } from "react-icons/fi";

interface DeleteSubcategoryButtonProps {
  subcategoryId: string;
}

export default function DeleteSubcategoryButton({ subcategoryId }: DeleteSubcategoryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Check if there are any products using this subcategory
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("subcategory_id", subcategoryId);

      if (products && products.length > 0) {
        alert("Cannot delete subcategory with existing products. Please reassign or delete products first.");
        return;
      }

      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", subcategoryId);

      if (error) throw error;

      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      alert("Failed to delete subcategory. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-900"
    >
      <FiTrash2 size={18} />
    </button>
  );
}
