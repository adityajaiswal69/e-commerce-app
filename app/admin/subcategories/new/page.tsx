import SubcategoryForm from "@/components/admin/SubcategoryForm";

export default function NewSubcategoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Add New Subcategory</h1>
      <div className="mx-auto max-w-2xl">
        <SubcategoryForm />
      </div>
    </div>
  );
}
