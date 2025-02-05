"use client";

import { useCart } from "@/contexts/CartContext";
import CartItem from "@/components/cart/CartItem";
import Link from "next/link";

export default function CartPage() {
  const { state } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Your Cart is Empty</h1>
        <p className="mb-8 text-gray-600">
          Add some products to your cart to get started.
        </p>
        <Link
          href="/products"
          className="inline-block rounded-md bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y">
            {state.items.map((item) => (
              <CartItem
                key={item.product.id}
                product={item.product}
                quantity={item.quantity}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-medium">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${state.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${state.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-md bg-blue-500 py-2 text-center text-white hover:bg-blue-600"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
