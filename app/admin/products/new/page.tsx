import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Add New Product</h1>
      <div className="mx-auto max-w-2xl">
        <ProductForm />
      </div>
    </div>
  );
}
