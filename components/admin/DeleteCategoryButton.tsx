"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
import { supabase } from "@/lib/supabase/client";

type DeleteCategoryButtonProps = {
  categoryId: string;
};

export default function DeleteCategoryButton({ categoryId }: DeleteCategoryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      // First check if there are any subcategories
      const { data: subcategories } = await supabase
        .from("subcategories")
        .select("id")
        .eq("category_id", categoryId);
      
      if (subcategories && subcategories.length > 0) {
        alert(`Cannot delete this category because it has ${subcategories.length} subcategories. Please delete the subcategories first.`);
        setIsDeleting(false);
        setShowConfirm(false);
        return;
      }
      
      // Delete the category
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);
      
      if (error) {
        throw error;
      }
      
      // Refresh the page
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      alert(`Error deleting category: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-900"
        title="Delete category"
      >
        <FiTrash2 size={18} />
      </button>
      
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
