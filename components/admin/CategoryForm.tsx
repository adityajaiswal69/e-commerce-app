"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Category } from "@/types/database.types";
import Image from "next/image";
import { uploadProductImage } from "@/lib/utils/upload";

type CategoryFormProps = {
  category?: Category;
};

type FormData = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
};

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.image_url || null
  );

  const [formData, setFormData] = useState<FormData>({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image_url: category?.image_url || "",
    display_order: category?.display_order || 0,
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      const imageUrl = await uploadProductImage(file);
      setFormData({ ...formData, image_url: imageUrl });
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate slug if empty
      if (!formData.slug) {
        formData.slug = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      if (category) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            image_url: formData.image_url,
            display_order: formData.display_order,
          })
          .eq("id", category.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          image_url: formData.image_url,
          display_order: formData.display_order,
        });

        if (error) throw error;
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Category Name
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          Slug (URL-friendly name)
        </label>
        <input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="mt-1 block w-full rounded-md border p-2"
          placeholder="Leave empty to auto-generate from name"
        />
        <p className="text-sm text-gray-500 mt-1">
          Used in URLs. Will be auto-generated if left empty.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category Image</label>
        <div className="flex items-center gap-4">
          {imagePreview && (
            <div className="relative h-24 w-24 rounded-md overflow-hidden">
              <Image
                src={imagePreview}
                alt="Category preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {imagePreview ? "Change Image" : "Upload Image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <label htmlFor="display_order" className="block text-sm font-medium mb-2">
          Display Order
        </label>
        <input
          id="display_order"
          type="number"
          min="0"
          value={formData.display_order}
          onChange={(e) =>
            setFormData({
              ...formData,
              display_order: parseInt(e.target.value) || 0,
            })
          }
          className="mt-1 block w-full rounded-md border p-2"
        />
        <p className="text-sm text-gray-500 mt-1">
          Categories with lower numbers will be displayed first.
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#333333] text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : category
            ? "Update Category"
            : "Create Category"}
        </button>
      </div>
    </form>
  );
}
