"use client";

import { PaymentProvider } from "@/types/payment.types";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentProvider | 'cod';
  onMethodChange: (method: PaymentProvider | 'cod') => void;
  availableMethods: PaymentProvider[];
}

const PAYMENT_METHOD_INFO = {
  razorpay: {
    name: 'Razorpay',
    description: 'Pay with UPI, Cards, Net Banking, or Wallets',
    icon: '💳',
  },
  stripe: {
    name: 'Stripe',
    description: 'Pay with Credit/Debit Cards',
    icon: '💳',
  },
  paytm: {
    name: 'Paytm',
    description: 'Pay with Paytm Wallet or UPI',
    icon: '📱',
  },
  cod: {
    name: 'Cash on Delivery',
    description: 'Pay when your order is delivered',
    icon: '💵',
  },
};

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  availableMethods,
}: PaymentMethodSelectorProps) {
  const allMethods = [...availableMethods, 'cod' as const];

  return (
    <div className="space-y-3">
      {allMethods.map((method) => {
        const info = PAYMENT_METHOD_INFO[method];
        const isSelected = selectedMethod === method;

        return (
          <div
            key={method}
            className={`
              relative border rounded-lg p-4 cursor-pointer transition-all
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            onClick={() => onMethodChange(method)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="payment-method"
                value={method}
                checked={isSelected}
                onChange={() => onMethodChange(method)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{info.icon}</span>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 cursor-pointer">
                      {info.name}
                    </label>
                    <p className="text-sm text-gray-500">{info.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional info for specific payment methods */}
            {isSelected && method === 'razorpay' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    UPI
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Cards
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Net Banking
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Wallets
                  </span>
                </div>
              </div>
            )}

            {isSelected && method === 'cod' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  ₹20 additional charges may apply for Cash on Delivery orders
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
