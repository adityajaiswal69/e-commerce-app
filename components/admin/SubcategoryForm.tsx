"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Subcategory, Category } from "@/types/database.types";
import Image from "next/image";
import { uploadProductImage } from "@/lib/utils/upload";

type SubcategoryFormProps = {
  subcategory?: Subcategory;
};

type FormData = {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
};

export default function SubcategoryForm({ subcategory }: SubcategoryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(
    subcategory?.image_url || null
  );

  const [formData, setFormData] = useState<FormData>({
    category_id: subcategory?.category_id || "",
    name: subcategory?.name || "",
    slug: subcategory?.slug || "",
    description: subcategory?.description || "",
    image_url: subcategory?.image_url || "",
    display_order: subcategory?.display_order || 0,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      setCategories(data);
      
      // Set default category if creating new subcategory and categories exist
      if (!subcategory && data.length > 0 && !formData.category_id) {
        setFormData({ ...formData, category_id: data[0].id });
      }
    };

    fetchCategories();
  }, []);

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
      if (!formData.category_id) {
        throw new Error("Please select a parent category");
      }

      // Generate slug if empty
      if (!formData.slug) {
        formData.slug = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      if (subcategory) {
        // Update existing subcategory
        const { error } = await supabase
          .from("subcategories")
          .update({
            category_id: formData.category_id,
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            image_url: formData.image_url,
            display_order: formData.display_order,
          })
          .eq("id", subcategory.id);

        if (error) throw error;
      } else {
        // Create new subcategory
        const { error } = await supabase.from("subcategories").insert({
          category_id: formData.category_id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          image_url: formData.image_url,
          display_order: formData.display_order,
        });

        if (error) throw error;
      }

      router.push("/admin/subcategories");
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
        <label htmlFor="category_id" className="block text-sm font-medium mb-2">
          Parent Category
        </label>
        <select
          id="category_id"
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
          className="mt-1 block w-full rounded-md border p-2"
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Subcategory Name
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
        <label className="block text-sm font-medium mb-2">Subcategory Image</label>
        <div className="flex items-center gap-4">
          {imagePreview && (
            <div className="relative h-24 w-24 rounded-md overflow-hidden">
              <Image
                src={imagePreview}
                alt="Subcategory preview"
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
          Subcategories with lower numbers will be displayed first.
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
            : subcategory
            ? "Update Subcategory"
            : "Create Subcategory"}
        </button>
      </div>
    </form>
  );
}
