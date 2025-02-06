import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  created_at: string;
};

type ProductManagementProps = {
  products: Product[];
};

export default function ProductManagement({
  products,
}: ProductManagementProps) {
  if (!products?.length) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-medium">Recent Products</h2>
        <p className="mt-2 text-sm text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-medium">Recent Products</h2>
      </div>

      <div className="divide-y">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-500">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <Link
              href={`/admin/products/${product.id}`}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Edit →
            </Link>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <Link
          href="/admin/products"
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          View All Products →
        </Link>
      </div>
    </div>
  );
}
