import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SubcategoryForm from "@/components/admin/SubcategoryForm";

export default async function EditSubcategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data: subcategory } = await supabase
    .from("subcategories")
    .select("*")
    .eq("id", id)
    .single();

  if (!subcategory) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Edit Subcategory</h1>
      <div className="mx-auto max-w-2xl">
        <SubcategoryForm subcategory={subcategory} />
      </div>
    </div>
  );
}
