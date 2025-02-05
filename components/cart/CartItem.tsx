"use client";

import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/database.types";

type CartItemProps = {
  product: Product;
  quantity: number;
};

export default function CartItem({ product, quantity }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-4 border-b py-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-medium">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
          <p className="text-lg font-medium">
            ${(product.price * quantity).toFixed(2)}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor={`quantity-${product.id}`} className="sr-only">
              Quantity
            </label>
            <select
              id={`quantity-${product.id}`}
              value={quantity}
              onChange={(e) =>
                updateQuantity(product.id, parseInt(e.target.value))
              }
              className="rounded-md border p-1"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => removeItem(product.id)}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
