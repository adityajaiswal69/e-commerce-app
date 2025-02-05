import Image from "next/image";
import Link from "next/link";

type ProductManagementProps = {
  products: Array<{
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock: number;
    active: boolean;
  }>;
};

export default function ProductManagement({
  products,
}: ProductManagementProps) {
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

            <div className="flex flex-1 items-center justify-between">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">
                  ${product.price.toFixed(2)} · {product.stock} in stock
                </p>
              </div>

              <Link
                href={`/admin/products/${product.id}/edit`}
                className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              >
                Edit
              </Link>
            </div>
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
