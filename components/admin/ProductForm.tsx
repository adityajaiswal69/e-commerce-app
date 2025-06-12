"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/types/database.types";
import { uploadProductImage } from "@/lib/utils/upload";
import Image from "next/image";

const STYLE_OPTIONS = [
  "Casual",
  "Formal",
  "Streetwear",
  "Vintage",
  "Minimalist",
  "Athletic",
];

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Blue",
  "Red",
  "Green",
  "Navy",
  "Brown",
  "Gray",
  "Beige",
];

const OCCASION_OPTIONS = [
  "Daily",
  "Work",
  "Party",
  "Sport",
  "Special Event",
  "Casual",
];

const SIZE_OPTIONS = {
  top: ["XS", "S", "M", "L", "XL", "XXL"],
  bottom: ["28", "30", "32", "34", "36", "38"],
  shoes: ["6", "7", "8", "9", "10", "11", "12"],
};

// Category and subcategory structure based on LeftNavbar.tsx
const CATEGORY_OPTIONS = [
  { value: "", label: "Select Category" },
  { value: "hotel-hospitality", label: "HOTEL/HOSPITALITY UNIFORM", hasSubcategories: true },
  { value: "school", label: "SCHOOL", hasSubcategories: false },
  { value: "automobile", label: "AUTOMOBILE", hasSubcategories: false },
  { value: "corporate", label: "CORPORATE", hasSubcategories: false },
  { value: "restaurant-cafe-pub", label: "RESTAURANT/CAFE/PUB", hasSubcategories: false },
  { value: "speciality-industry", label: "SPECIALITY INDUSTRY UNIFORM", hasSubcategories: false },
  { value: "hospital-uniform", label: "HOSPITAL UNIFORM", hasSubcategories: true },
  { value: "medical-factory", label: "MEDICAL FACTORY UNIFORM", hasSubcategories: false },
  { value: "factory-workers", label: "FACTORY WORKERS UNIFORM", hasSubcategories: false },
  { value: "catering-uniform", label: "CATERING UNIFORM", hasSubcategories: false },
  { value: "fashion", label: "FASHION", hasSubcategories: false },
];

// Subcategories for categories that have them
const SUBCATEGORY_OPTIONS: Record<string, Array<{value: string, label: string}>> = {
  "hotel-hospitality": [
    { value: "milk-uniform", label: "Milk Uniform" },
    { value: "maintenance-uniform", label: "Maintenance Uniform" },
    { value: "kitchen-uniform", label: "Kitchen Uniform" },
    { value: "chef-uniform", label: "Chef Uniform" },
    { value: "fb-gsa-waiter", label: "F&B GSA/Waiter" },
    { value: "pool-uniform", label: "Pool - Uniform" },
    { value: "spa-uniform", label: "Spa - Uniform" },
    { value: "manager", label: "Manager" },
    { value: "bell-boy", label: "Bell Boy" },
    { value: "valet-uniform", label: "Valet Uniform" },
    { value: "hostess-uniform", label: "Hostess Uniform" },
    { value: "security-guard-uniform", label: "Security Guard Uniform" },
    { value: "back-office", label: "Back Office" }
  ],
  "hospital-uniform": [
    { value: "doctor-coat", label: "Doctor Coat" },
    { value: "nurse-uniform", label: "Nurse Uniform" },
    { value: "patient-uniform", label: "Patient Uniform" },
    { value: "back-office", label: "Back Office" }
  ]
};

type ProductFormProps = {
  product?: Product;
};

type FormData = {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  subcategory: string;
  stock: number;
  active: boolean;
  style: string[];
  colors: string[];
  sizes: {
    top: string[];
    bottom: string[];
    shoes: string[];
  };
  occasions: string[];
};

async function deleteProductImage(imageUrl: string) {
  try {
    // Extract file path from URL
    const path = imageUrl.split("/").slice(-2).join("/"); // Gets "products/filename.ext"

    const { error } = await supabase.storage
      .from("product-images")
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url || null
  );
  const [showSubcategory, setShowSubcategory] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    image_url: product?.image_url || "",
    category: product?.category || "",
    subcategory: "", // Initialize subcategory as empty string
    stock: product?.stock || 0,
    active: product?.active ?? true,
    style: product?.style || [],
    colors: product?.colors || [],
    sizes: {
      top: product?.sizes?.top ?? [],
      bottom: product?.sizes?.bottom ?? [],
      shoes: product?.sizes?.shoes ?? [],
    },
    occasions: product?.occasions || [],
  });
  
  // Fetch subcategories when category changes
  useEffect(() => {
    const selectedCategory = CATEGORY_OPTIONS.find(cat => cat.value === formData.category);
    const hasSubcategories = selectedCategory?.hasSubcategories || false;
    setShowSubcategory(hasSubcategories);
    
    // Reset subcategory when category changes
    if (formData.subcategory && !hasSubcategories) {
      setFormData(prev => ({ ...prev, subcategory: "" }));
    }
  }, [formData.category]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setLoading(true);
      const imageUrl = await uploadProductImage(file);
      setFormData({ ...formData, image_url: imageUrl });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMultiSelect = (
    field: "style" | "colors" | "occasions",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field]?.filter((item) => item !== value)
        : [...(prev[field] || []), value],
    }));
  };

  const handleSizeChange = (
    category: keyof typeof SIZE_OPTIONS,
    size: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      sizes: {
        ...(prev.sizes || {}),
        [category]: prev.sizes?.[category]?.includes(size)
          ? prev.sizes[category]?.filter((s) => s !== size)
          : [...(prev.sizes?.[category] || []), size],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      setError("Please upload an image");
      return;
    }
    
    // Validate subcategory if category has subcategories
    if (showSubcategory && !formData.subcategory) {
      setError("Please select a subcategory");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a product data object with the appropriate structure
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        image_url: formData.image_url,
        category: formData.category,
        stock: formData.stock,
        active: formData.active,
        style: formData.style,
        colors: formData.colors,
        sizes: formData.sizes,
        occasions: formData.occasions
      };
      
      // If subcategory is selected, append it to the category
      if (showSubcategory && formData.subcategory) {
        // Use the subcategory as part of the category path
        productData.category = `${formData.category}/${formData.subcategory}`;
      }

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Delete the product first
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) throw deleteError;

      // Then delete the associated image
      if (product.image_url) {
        await deleteProductImage(product.image_url);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500">{error}</div>}

      <div>
        <label className="block text-sm font-medium">Product Image</label>
        <div className="mt-1 flex items-center space-x-4">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Product preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-50">
                <span className="text-sm text-gray-500">No image</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Change Image
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            value={formData.category}
            onChange={(e) => {
              setFormData({ ...formData, category: e.target.value, subcategory: "" });
            }}
            className="mt-1 block w-full rounded-md border p-2"
            required
          >
            {CATEGORY_OPTIONS.map((category, index) => (
              <option key={index} value={category.value} disabled={index === 0 && category.value === ""}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border p-2"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Stock</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: Number(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border p-2"
            required
            min="0"
          />
        </div>
        
        {showSubcategory && (
          <div>
            <label className="block text-sm font-medium">Subcategory</label>
            <select
              value={formData.subcategory}
              onChange={(e) => 
                setFormData({ ...formData, subcategory: e.target.value })
              }
              className="mt-1 block w-full rounded-md border p-2"
              required={showSubcategory}
            >
              <option value="">Select Subcategory</option>
              {formData.category && SUBCATEGORY_OPTIONS[formData.category]?.map((subcategory, index) => (
                <option key={index} value={subcategory.value}>
                  {subcategory.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="mt-1 block w-full rounded-md border p-2"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Image URL</label>
        <input
          type="url"
          value={formData.image_url}
          onChange={(e) =>
            setFormData({ ...formData, image_url: e.target.value })
          }
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Styles</label>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => handleMultiSelect("style", style)}
              className={`px-4 py-2 rounded-full ${
                formData.style?.includes(style)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Colors</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleMultiSelect("colors", color)}
              className={`px-4 py-2 rounded-full ${
                formData.colors?.includes(color)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Available Sizes
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SIZE_OPTIONS).map(([category, sizes]) => (
            <div key={category}>
              <label className="block text-sm font-medium mb-2 capitalize">
                {category}
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      handleSizeChange(
                        category as keyof typeof SIZE_OPTIONS,
                        size
                      )
                    }
                    className={`px-3 py-1 rounded ${
                      formData.sizes?.[
                        category as keyof typeof SIZE_OPTIONS
                      ]?.includes(size)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Occasions</label>
        <div className="flex flex-wrap gap-2">
          {OCCASION_OPTIONS.map((occasion) => (
            <button
              key={occasion}
              type="button"
              onClick={() => handleMultiSelect("occasions", occasion)}
              className={`px-4 py-2 rounded-full ${
                formData.occasions?.includes(occasion)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) =>
              setFormData({ ...formData, active: e.target.checked })
            }
            className="rounded"
          />
          <span className="text-sm font-medium">Active</span>
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : product
            ? "Update Product"
            : "Create Product"}
        </button>

        {product && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
