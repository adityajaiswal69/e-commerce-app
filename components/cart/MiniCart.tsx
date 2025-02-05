"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function MiniCart() {
  const { state } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartItemCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-600 hover:text-blue-600"
      >
        <span>Cart ({cartItemCount})</span>
      </button>

      {isOpen && cartItemCount > 0 && (
        <div className="absolute right-0 top-8 z-50 w-80 rounded-lg border bg-white p-4 shadow-lg">
          <div className="max-h-96 space-y-4 overflow-auto">
            {state.items.map((item) => (
              <div key={item.product.id} className="flex gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <h3 className="text-sm font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × ${item.product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${state.total.toFixed(2)}</span>
            </div>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="mt-4 block w-full rounded-md bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
