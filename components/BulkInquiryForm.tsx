"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";

type Category = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
};

type Subcategory = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  display_order: number;
};

type FormData = {
  name: string;
  businessName: string;
  contactNo: string;
  email: string;
  category: string;
  subcategory: string;
};

export default function BulkInquiryForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    businessName: "",
    contactNo: "",
    email: "",
    category: "",
    subcategory: "",
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const supabase = createClientComponentClient<Database>();

  // Fetch categories and subcategories from database
  const fetchCategoriesAndSubcategories = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch all subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('display_order', { ascending: true });

      if (subcategoriesError) throw subcategoriesError;

      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error fetching categories and subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndSubcategories();
  }, []);

  // Filter subcategories based on selected category
  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      if (selectedCategory) {
        const filtered = subcategories.filter(sub => sub.category_id === selectedCategory.id);
        setFilteredSubcategories(filtered);
      }
    } else {
      setFilteredSubcategories([]);
    }
    // Reset subcategory when category changes
    setFormData(prev => ({ ...prev, subcategory: "" }));
  }, [formData.category, categories, subcategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // Get category and subcategory names for display
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const selectedSubcategory = subcategories.find(sub => sub.id === formData.subcategory);

      // Here you would typically save to database or send email
      console.log("Bulk inquiry submission:", {
        ...formData,
        categoryName: selectedCategory?.name,
        subcategoryName: selectedSubcategory?.name,
      });

      // Reset form after successful submission
      setFormData({
        name: "",
        businessName: "",
        contactNo: "",
        email: "",
        category: "",
        subcategory: "",
      });

      // Show success message (you can replace this with a toast notification)
      alert("Thank you for your inquiry! We will contact you soon.");
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("There was an error submitting your inquiry. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section className="bg-[#333333] py-8 sm:py-12 lg:py-16 rounded-lg">
      <div className="container mx-auto px-4">
        {/* Responsive heading */}
        <div className="text-center mb-8">
          <h2 className="mb-3 text-xl font-bold text-white sm:mb-4 sm:text-2xl lg:text-3xl">
            Bulk Inquiry Form
          </h2>
          <p className="mb-6 text-sm text-[#e9e2a3] sm:mb-8 sm:text-base lg:mb-10 lg:text-lg">
            Get in touch with us for bulk orders and special pricing
          </p>
        </div>
        
        {/* Form container */}
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name and Business Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#e9e2a3] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-2 border-[#6C6F7D] bg-white p-3 text-sm text-[#2E3138] placeholder-[#6C6F7D] focus:border-[#e9e2a3] focus:outline-none focus:ring-2 focus:ring-[#e9e2a3]/20"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-[#e9e2a3] mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-2 border-[#6C6F7D] bg-white p-3 text-sm text-[#2E3138] placeholder-[#6C6F7D] focus:border-[#e9e2a3] focus:outline-none focus:ring-2 focus:ring-[#e9e2a3]/20"
                  placeholder="Enter your business name"
                  required
                />
              </div>
            </div>

            {/* Contact and Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactNo" className="block text-sm font-medium text-[#e9e2a3] mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="contactNo"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-2 border-[#6C6F7D] bg-white p-3 text-sm text-[#2E3138] placeholder-[#6C6F7D] focus:border-[#e9e2a3] focus:outline-none focus:ring-2 focus:ring-[#e9e2a3]/20"
                  placeholder="Enter your contact number"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#e9e2a3] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-2 border-[#6C6F7D] bg-white p-3 text-sm text-[#2E3138] placeholder-[#6C6F7D] focus:border-[#e9e2a3] focus:outline-none focus:ring-2 focus:ring-[#e9e2a3]/20"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Category and Subcategory Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[#e9e2a3] mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-2 border-[#6C6F7D] bg-white p-3 text-sm text-[#2E3138] focus:border-[#e9e2a3] focus:outline-none focus:ring-2 focus:ring-[#e9e2a3]/20"
                  required
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Only show subcategory if there are filtered subcategories for the selected category */}
              {filteredSubcategories.length > 0 && (
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-[#e9e2a3] mb-2">
                    Subcategory *
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-2 border-[#6C6F7D] bg-white p-3 text-sm text-[#2E3138] focus:border-[#e9e2a3] focus:outline-none focus:ring-2 focus:ring-[#e9e2a3]/20"
                    required
                    disabled={loading}
                  >
                    <option value="">Select a subcategory</option>
                    {filteredSubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={submitLoading || loading}
                className="px-8 py-3 text-sm font-medium text-[#333333] bg-[#e9e2a3] border border-[#333333] rounded-md hover:bg-[#f8f6e1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? "Submitting..." : "Submit Inquiry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}