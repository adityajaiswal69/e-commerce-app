import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/database.types";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-lg border p-4 transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square relative overflow-hidden rounded-lg">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        <p className="mt-2 text-lg font-bold">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
