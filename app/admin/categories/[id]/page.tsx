import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Edit Category</h1>
      <div className="mx-auto max-w-2xl">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
