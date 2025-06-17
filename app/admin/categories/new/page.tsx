import CategoryForm from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Add New Category</h1>
      <div className="mx-auto max-w-2xl">
        <CategoryForm />
      </div>
    </div>
  );
}
