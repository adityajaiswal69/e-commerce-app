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
  color?: string;
  fabric?: string[];
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

  // Helper function to format fabric array
  const formatFabric = (fabric?: string[]): string => {
    if (!fabric || !Array.isArray(fabric) || fabric.length === 0) {
      return '';
    }
    return fabric.join(', ');
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
      
      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => {
          const itemKey = item.cartItemId || item.id || item.productId || `item-${index}`;
          const imageUrl = item.image || item.image_url || '/placeholder-image.svg';
          const fabricText = formatFabric(item.fabric);
          
          return (
            <div key={itemKey} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.svg';
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                  {item.name}
                </h4>
                
                <div className="space-y-1">
                  {item.category && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Category:</span> {item.category}
                    </p>
                  )}
                  
                  {item.size && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Size:</span> {item.size}
                    </p>
                  )}
                  
                  {item.color && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Color:</span> {item.color}
                    </p>
                  )}
                  
                  {fabricText && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Fabric:</span> {fabricText}
                    </p>
                  )}
                  
                  {(item.customization || item.designId) && (
                    <p className="text-xs text-blue-600 font-medium">
                      ✨ Custom Design
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-600">
                    Qty: <span className="font-medium">{item.quantity}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    ₹{item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-semibold text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          <span className="text-gray-900 font-medium">₹{safeTotals.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Shipping
            {safeTotals.shippingAmount === 0 && safeTotals.subtotal >= 500 && (
              <span className="text-green-600 ml-1 font-medium">(Free shipping applied!)</span>
            )}
          </span>
          <span className="text-gray-900 font-medium">
            {safeTotals.shippingAmount === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `₹${safeTotals.shippingAmount.toFixed(2)}`
            )}
          </span>
        </div>

        {safeTotals.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600 font-medium">-₹{safeTotals.discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">₹{safeTotals.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Free Shipping Notice */}
      {safeTotals.subtotal < 500 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Add ₹{(500 - safeTotals.subtotal).toFixed(2)} more to get free shipping!
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Free shipping on orders above ₹500
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Items Count */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          {items.reduce((total, item) => total + item.quantity, 0)} items in your order
        </p>
      </div>
    </div>
  );
}