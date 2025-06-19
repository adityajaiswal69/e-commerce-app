"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const DEFAULT_IMAGE = "/placeholder-image.svg";

export default function CompactCart() {
  const { items, total } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const cartItemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cart Icon */}
      <Link 
        href="/cart" 
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-50 transition-colors relative"
      >
        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {/* Cart Badge */}
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </Link>

      {/* Hover Popup */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
          {cartItemCount === 0 ? (
            /* Empty Cart State */
            <div className="p-4 text-center">
              <svg 
                className="mx-auto h-8 w-8 text-gray-400 mb-2" 
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
              <p className="text-gray-500 text-sm mb-3">Your cart is empty</p>
              <Link
                href="/products"
                className="inline-block px-3 py-1.5 bg-[#333333] text-[#e9e2a3] rounded text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            /* Cart Items */
            <>
              <div className="max-h-60 overflow-y-auto p-3">
                <div className="space-y-2">
                  {items.slice(0, 4).map((item) => (
                    <div key={item.cartItemId} className="flex gap-2 p-2 rounded hover:bg-gray-50">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                        <Image
                          src={item.image_url || DEFAULT_IMAGE}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">Size: {item.size}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          <span className="text-xs font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <p className="text-xs text-gray-500 text-center py-1">
                      +{items.length - 4} more items
                    </p>
                  )}
                </div>
              </div>

              {/* Cart Footer */}
              <div className="border-t bg-gray-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Total:</span>
                  <span className="text-sm font-bold text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                <Link
                  href="/cart"
                  className="block w-full text-center px-3 py-1.5 bg-[#333333] text-[#e9e2a3] rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
