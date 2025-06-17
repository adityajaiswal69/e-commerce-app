"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Product, Category, Subcategory } from "@/types/database.types";
import ProductImageUploader from "./ProductImageUploader";
// import DebugAuth from "./DebugAuth";

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



type ProductFormProps = {
  product?: Product;
};

type ViewType = 'front' | 'back' | 'left' | 'right';

type FormData = {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  subcategory_id: string | null;
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
  viewImages: Record<ViewType, string>;
};

async function deleteProductImage(imageUrl: string) {
  try {
    // Extract file path from URL - for product-images bucket, path should be "products/filename.ext"
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const path = `products/${fileName}`;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    image_url: product?.image_url || "",
    category_id: "", // Will be set from product data or selected
    subcategory_id: product?.subcategory_id || null,
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
    viewImages: {
      front: product?.front_image_url || product?.image_url || "",
      back: product?.back_image_url || "",
      left: product?.left_image_url || "",
      right: product?.right_image_url || ""
    }
  });
  


  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("display_order", { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from("subcategories")
          .select("*")
          .order("display_order", { ascending: true });

        if (subcategoriesError) throw subcategoriesError;
        setSubcategories(subcategoriesData || []);

        // If editing a product, find and set the category_id from subcategory
        if (product && product.subcategory_id && subcategoriesData) {
          const productSubcategory = subcategoriesData.find(sub => sub.id === product.subcategory_id);
          if (productSubcategory) {
            setFormData(prev => ({
              ...prev,
              category_id: productSubcategory.category_id,
              subcategory_id: product.subcategory_id
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching categories/subcategories:", error);
        setError("Failed to load categories and subcategories");
      }
    };

    fetchCategoriesAndSubcategories();
  }, [product]);

  // Filter subcategories based on selected category
  useEffect(() => {
    if (formData.category_id) {
      const filtered = subcategories.filter(sub => sub.category_id === formData.category_id);
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category_id, subcategories]);



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

  const handleViewImageUpdate = (viewType: ViewType, imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      viewImages: {
        ...prev.viewImages,
        [viewType]: imageUrl
      },
      // Update main image_url if front view is updated
      ...(viewType === 'front' && { image_url: imageUrl })
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.viewImages.front) {
      setError("Please upload a front view image");
      return;
    }

    // Validate category selection
    if (!formData.category_id) {
      setError("Please select a category");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get category slug for the category field (for backward compatibility)
      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      const categorySlug = selectedCategory?.slug || '';

      // Create a product data object with the appropriate structure
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        image_url: formData.viewImages.front, // Use front view as main image
        front_image_url: formData.viewImages.front,
        back_image_url: formData.viewImages.back || null,
        left_image_url: formData.viewImages.left || null,
        right_image_url: formData.viewImages.right || null,
        category: categorySlug, // Use category slug for backward compatibility
        subcategory_id: formData.subcategory_id || null,
        stock: formData.stock,
        active: formData.active,
        style: formData.style,
        colors: formData.colors,
        sizes: formData.sizes,
        occasions: formData.occasions
      };

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
{/* 
      <DebugAuth /> */}

      <ProductImageUploader
        productImages={formData.viewImages}
        onImageUpdate={handleViewImageUpdate}
        loading={loading}
        setLoading={setLoading}
        setError={setError}
      />

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
            value={formData.category_id}
            onChange={(e) => {
              setFormData({ ...formData, category_id: e.target.value, subcategory_id: null });
            }}
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
        
        {filteredSubcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium">Subcategory</label>
            <select
              value={formData.subcategory_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, subcategory_id: e.target.value || null })
              }
              className="mt-1 block w-full rounded-md border p-2"
            >
              <option value="">Select Subcategory (Optional)</option>
              {filteredSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
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
