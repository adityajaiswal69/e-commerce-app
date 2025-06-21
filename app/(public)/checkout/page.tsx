"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCart } from "@/contexts/CartContext";
import CheckoutForm from "@/components/checkout/NewCheckoutForm";
import CheckoutErrorBoundary from "@/components/checkout/CheckoutErrorBoundary";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();
  const supabase = createClientComponentClient();
  
  // Require authentication for checkout
  const { user, loading: authLoading, isAuthenticated } = useAuthGuard({
    message: 'Please sign in to proceed with checkout',
    redirectTo: '/sign-in'
  });

  useEffect(() => {
    // Redirect to cart if no items
    if (!authLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router, authLoading]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-600">
          Add some items to your cart before proceeding to checkout.
        </p>
        <div className="mt-6">
          <a
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  const handleOrderComplete = (orderId: string) => {
    router.push(`/checkout/success?order_id=${orderId}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-2 text-gray-600">
          Complete your order by providing your shipping details and payment information.
        </p>
      </div>

      <CheckoutErrorBoundary>
        <CheckoutForm onOrderComplete={handleOrderComplete} />
      </CheckoutErrorBoundary>
    </div>
  );
}
