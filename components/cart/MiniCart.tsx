"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const DEFAULT_IMAGE = "/placeholder-image.svg";

export default function MiniCart() {
  const { items } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log("MiniCart - items:", items);
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  console.log("MiniCart - cartItemCount:", cartItemCount);

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

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 rounded-lg border-2 border-gray-200 hover:border-[#e9e2a3] hover:bg-[#f8f6e1] transition-all duration-200 group"
      >
        <div className="flex items-center space-x-3">
          {/* Cart Icon */}
          <div className="relative">
            <svg
              className="h-6 w-6 text-gray-700 group-hover:text-[#333333]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {/* Cart Count Badge */}
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">Cart</p>
            <p className="text-xs text-gray-500">
              {cartItemCount === 0 ? 'Empty' : `${cartItemCount} item${cartItemCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`h-4 w-4 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-full max-w-sm z-50 rounded-lg border bg-white shadow-xl overflow-hidden">
          {cartItemCount === 0 ? (
            /* Empty Cart State */
            <div className="p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-gray-500 text-sm mb-4">Your cart is empty</p>
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="inline-block px-4 py-2 bg-[#333333] text-[#e9e2a3] rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            /* Cart Items */
            <>
              <div className="max-h-80 overflow-y-auto p-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={item.image_url || DEFAULT_IMAGE}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">Size: {item.size}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          <span className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Footer */}
              <div className="border-t bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-[#333333] text-[#e9e2a3] rounded-md hover:bg-gray-800 transition-colors font-medium"
                >
                  View Cart & Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
