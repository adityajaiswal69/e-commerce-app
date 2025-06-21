import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import DeleteSubcategoryButton from "@/components/admin/DeleteSubcategoryButton";

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  category: {
    name: string;
    slug: string;
  };
};

export default async function SubcategoriesPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Check if user is authenticated and is admin
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/subcategories");
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
  
  // Fetch all subcategories with their parent categories
  const { data: subcategories, error } = await supabase
    .from("subcategories")
    .select(`
      *,
      category:categories(name, slug)
    `)
    .order('display_order', { ascending: true }) as { 
      data: Subcategory[] | null, 
      error: { message: string } | null 
    };

  if (error) {
    console.error("Error fetching subcategories:", error.message);
    throw new Error(error.message);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#333333]">Subcategories Management</h1>
        <div className="flex gap-3">
          <Link 
            href="/admin/categories" 
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Manage Categories
          </Link>
          <Link 
            href="/admin/subcategories/new" 
            className="flex items-center gap-2 bg-[#333333] text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          >
            <FiPlus size={18} />
            <span>Add Subcategory</span>
          </Link>
        </div>
      </div>

      {!subcategories || subcategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No subcategories found.</p>
          <Link 
            href="/admin/subcategories/new"
            className="inline-flex items-center gap-2 bg-[#333333] text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          >
            <FiPlus size={18} />
            <span>Create First Subcategory</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subcategories.map((subcategory) => (
                <tr key={subcategory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 relative rounded-md overflow-hidden bg-gray-100">
                      {subcategory.image_url ? (
                        <Image
                          src={subcategory.image_url}
                          alt={subcategory.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <span className="text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{subcategory.category?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{subcategory.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{subcategory.display_order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/subcategories/${subcategory.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit2 size={18} />
                      </Link>
                      <DeleteSubcategoryButton subcategoryId={subcategory.id} />
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
