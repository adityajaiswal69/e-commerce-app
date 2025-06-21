"use client";

import Image from "next/image";

interface OrderItem {
  cartItemId?: string;
  productId?: string;
  id?: string;
  name: string;
  image?: string;
  image_url?: string;
  price: number;
  quantity: number;
  size?: string;
  category?: string;
  customization?: any;
  designId?: string;
}

interface OrderTotals {
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  totals?: OrderTotals;
}

export default function OrderSummary({ items, totals }: OrderSummaryProps) {
  // Provide default values if totals is undefined
  const safeTotals = totals || {
    subtotal: 0,
    shippingAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
      
      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <div key={item.cartItemId || item.id || item.productId || `item-${index}`} className="flex items-center space-x-4">
            <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden">
              <Image
                src={item.image || item.image_url || '/placeholder-image.svg'}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h4>
              {item.size && (
                <p className="text-xs text-gray-500">
                  Size: {item.size}
                </p>
              )}
              {(item.customization || item.designId) && (
                <p className="text-xs text-gray-500">
                  Custom Design
                </p>
              )}
              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>
            <div className="text-sm font-medium text-gray-900">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">₹{safeTotals.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Shipping
            {safeTotals.shippingAmount === 0 && (
              <span className="text-green-600 ml-1">(Free)</span>
            )}
          </span>
          <span className="text-gray-900">
            {safeTotals.shippingAmount === 0 ? 'Free' : `₹${safeTotals.shippingAmount.toFixed(2)}`}
          </span>
        </div>

        {safeTotals.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">-₹{safeTotals.discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-base font-medium">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">₹{safeTotals.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Free Shipping Notice */}
      {safeTotals.subtotal < 500 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Add ₹{(500 - safeTotals.subtotal).toFixed(2)} more to get free shipping!
          </p>
        </div>
      )}
    </div>
  );
}
