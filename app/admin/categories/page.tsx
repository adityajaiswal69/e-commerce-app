import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default async function CategoriesPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Check if user is authenticated and is admin
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/categories");
  }
  
  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
    
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }
  
  // Fetch all categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order('display_order', { ascending: true }) as { data: Category[] | null, error: { message: string } | null };

  if (error) {
    console.error("Error fetching categories:", error.message);
    throw new Error(error.message);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#333333]">Categories Management</h1>
        <Link 
          href="/admin/categories/new" 
          className="flex items-center gap-2 bg-[#333333] text-white px-4 py-2 rounded-md hover:bg-opacity-90"
        >
          <FiPlus size={18} />
          <span>Add Category</span>
        </Link>
      </div>
      
      {categories && categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No categories found</p>
          <Link 
            href="/admin/categories/new" 
            className="inline-flex items-center gap-2 bg-[#333333] text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          >
            <FiPlus size={18} />
            <span>Create your first category</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories?.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.image_url ? (
                      <div className="h-10 w-10 rounded-md overflow-hidden relative">
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.display_order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit2 size={18} />
                      </Link>
                      <DeleteCategoryButton categoryId={category.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}