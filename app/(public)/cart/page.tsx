"use client";

import { useCart } from "@/contexts/CartContext";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import Image from "next/image";

const DEFAULT_IMAGE = "/placeholder-image.svg";

export default function CartPage() {
  const { items, removeItem } = useCart();

  // Debug logging
  console.log("Cart page - items:", items);
  console.log("Cart page - items length:", items.length);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-gray-600">
          Add some items to your cart to continue shopping.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {/* Debug section - remove this after fixing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <h3 className="font-bold">Debug Info:</h3>
          <p>Items count: {items.length}</p>
          <p>Items data: {JSON.stringify(items, null, 2)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <div className="relative w-24 h-24">
                <Image
                  src={item.image_url || DEFAULT_IMAGE}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-600">Size: {item.size}</p>
                  <p className="text-sm text-gray-600">
                    Category: {item.category}
                  </p>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <p>Quantity: {item.quantity}</p>
                  <button
                    onClick={() => removeItem(item.cartItemId!)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Section */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <CheckoutForm />
          </div>
        </div>
      </div>
    </div>
  );
}
