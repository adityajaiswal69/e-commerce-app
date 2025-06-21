"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { Address, PaymentProvider } from "@/types/payment.types";
import toast from "react-hot-toast";
import AddressForm from "./AddressForm";
import PaymentMethodSelector from "./PaymentMethodSelector";
import OrderSummary from "./OrderSummary";
import DatabaseSetupError from "./DatabaseSetupError";
import { handleSupabaseError, getSafeErrorMessage, safeErrorLog } from "@/lib/utils/error-handler";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutFormProps {
  onOrderComplete?: (orderId: string) => void;
}

export default function CheckoutForm({ onOrderComplete }: CheckoutFormProps) {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider | 'cod'>('razorpay');
  const [notes, setNotes] = useState('');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentProvider[]>([]);
  const [codEnabled, setCodEnabled] = useState(false);
  const [databaseSetupError, setDatabaseSetupError] = useState(false);

  useEffect(() => {
    checkUser();
    fetchAvailablePaymentMethods();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/sign-in');
      return;
    }
    setUser(user);
  };

  const fetchAvailablePaymentMethods = async () => {
    const { data: settings } = await supabase
      .from('payment_settings')
      .select('provider')
      .eq('is_active', true);

    if (settings) {
      const providers = settings.map(s => s.provider);
      // Separate COD from other payment gateways
      const gatewayProviders = providers.filter(p => p !== 'cod') as PaymentProvider[];
      const isCodEnabled = providers.includes('cod');

      setAvailablePaymentMethods(gatewayProviders);
      setCodEnabled(isCodEnabled);

      // Update selected payment method if current selection is not available
      const allAvailableMethods = isCodEnabled ? [...gatewayProviders, 'cod'] : gatewayProviders;
      if (!allAvailableMethods.includes(paymentMethod)) {
        if (allAvailableMethods.length > 0) {
          setPaymentMethod(allAvailableMethods[0] as PaymentProvider | 'cod');
        }
      }
    }
  };

  const calculateTotals = () => {
    const subtotal = total || 0; // Ensure subtotal is never undefined
    const shippingAmount = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const discountAmount = 0; // Can be implemented later
    const totalAmount = subtotal + shippingAmount - discountAmount;

    return {
      subtotal,
      shippingAmount,
      discountAmount,
      totalAmount,
    };
  };

  // Fallback order creation for when payment system tables don't exist
  const createFallbackOrder = async (totals: any): Promise<string | null> => {
    try {
      if (!user || !shippingAddress) {
        throw new Error('Missing required user or address information');
      }

      // Try different fallback strategies
      console.log('Attempting fallback order creation...');

      // Strategy 1: Try with minimal required fields
      let orderData: any = {
        user_id: user.id,
        total_amount: Number(totals.totalAmount.toFixed(2)),
        status: 'pending',
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
      };

      console.log('Trying minimal order data:', orderData);

      let { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      // Strategy 2: If that fails, try with address as JSONB
      if (error) {
        console.log('Minimal order failed, trying with JSONB addresses...');
        orderData = {
          ...orderData,
          shipping_address: shippingAddress,
          billing_address: useSameAddress ? shippingAddress : billingAddress,
          notes: notes || null,
        };

        const result = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        order = result.data;
        error = result.error;
      }

      // Strategy 3: If that fails, try with address as text
      if (error) {
        console.log('JSONB addresses failed, trying with text addresses...');
        orderData = {
          ...orderData,
          shipping_address: JSON.stringify(shippingAddress),
          billing_address: JSON.stringify(useSameAddress ? shippingAddress : billingAddress),
        };

        const result = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        order = result.data;
        error = result.error;
      }

      if (error) {
        safeErrorLog('All Fallback Strategies Failed', error);
        const errorMessage = getSafeErrorMessage(error);

        // Provide helpful error message based on error type
        if (error.code === '42P01') {
          throw new Error('Orders table does not exist. Please run the database setup script.');
        } else if (error.code === '42703') {
          throw new Error('Orders table exists but has different columns. Please update your database schema.');
        } else if (error.code === '23502') {
          throw new Error('Missing required fields. Please check your database schema.');
        } else {
          throw new Error(`All fallback strategies failed: ${errorMessage}`);
        }
      }

      if (!order || !order.id) {
        throw new Error('Fallback order created but no order data returned');
      }

      console.log('Fallback order created successfully:', order);
      return order.id;
    } catch (err) {
      console.error('Fallback order creation error:', err);

      if (err instanceof Error) {
        throw err; // Re-throw to be handled by the calling function
      } else {
        throw new Error('Unknown error in fallback order creation');
      }
    }
  };

  const createOrder = async (): Promise<string | null> => {
    try {
      if (!shippingAddress || !user) {
        console.error('Missing required data:', { shippingAddress: !!shippingAddress, user: !!user });
        toast.error('Missing required information. Please check your details.');
        return null;
      }

      const totals = calculateTotals();
      console.log('Creating order with totals:', totals);

      // First, let's check if the orders table exists
      const { error: tableError } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

      if (tableError) {
        safeErrorLog('Table Access Check', tableError);

        // Safely extract error code
        const errorCode = (tableError as any)?.code || 'UNKNOWN';

        // If payment system tables don't exist, show database setup error
        if (errorCode === '42P01') {
          console.log('Payment system tables not found - showing setup instructions');
          setDatabaseSetupError(true);
          return null;
        }

        handleSupabaseError('Database Access', tableError);
        return null;
      }

      const orderData = {
        user_id: user.id,
        payment_method: paymentMethod,
        subtotal: Number(totals.subtotal.toFixed(2)),
        tax_amount: 0, // GST removed
        shipping_amount: Number(totals.shippingAmount.toFixed(2)),
        discount_amount: Number(totals.discountAmount.toFixed(2)),
        total_amount: Number(totals.totalAmount.toFixed(2)),
        currency: 'INR',
        shipping_address: shippingAddress,
        billing_address: useSameAddress ? shippingAddress : billingAddress,
        notes: notes || null,
      };

      console.log('Inserting order data:', orderData);

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        handleSupabaseError('Order Creation', error);
        return null;
      }

      if (!order || !order.id) {
        console.error('Order created but no order data returned');
        toast.error('Order creation failed. Please try again.');
        return null;
      }

      console.log('Order created successfully:', order);

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        design_id: null, // Will be added when design functionality is integrated
        quantity: item.quantity,
        unit_price: Number(item.price.toFixed(2)),
        total_price: Number((item.price * item.quantity).toFixed(2)),
        product_snapshot: {
          name: item.name,
          image: item.image_url,
          size: item.size,
          category: item.category,
        },
        customization_details: null, // Will be added when customization is integrated
      }));

      console.log('Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        safeErrorLog('Order Items Creation', itemsError);

        // Try to clean up the order if items creation failed
        try {
          await supabase.from('orders').delete().eq('id', order.id);
          console.log('Cleaned up order after items creation failure');
        } catch (cleanupError) {
          safeErrorLog('Order Cleanup', cleanupError);
        }

        const errorMessage = getSafeErrorMessage(itemsError);
        toast.error(`Failed to create order items: ${errorMessage}`);
        return null;
      }

      console.log('Order and items created successfully');
      return order.id;
    } catch (err) {
      console.error('Unexpected error in createOrder:', err);

      // Provide more specific error messages based on error type
      if (err instanceof Error) {
        if (err.message.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else if (err.message.includes('timeout')) {
          toast.error('Request timed out. Please try again.');
        } else {
          toast.error(`Order creation failed: ${err.message}`);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }

      return null;
    }
  };

  const processRazorpayPayment = async (orderId: string) => {
    try {
      // Create Razorpay order
      const response = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      const { razorpay_order, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpay_order.amount,
        currency: razorpay_order.currency,
        name: 'Uniformat',
        description: `Order #${razorpay_order.receipt}`,
        order_id: razorpay_order.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              order_id: orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.success) {
            clearCart();
            toast.success('Payment successful!');
            onOrderComplete?.(orderId);
            router.push(`/checkout/success?order_id=${orderId}`);
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: shippingAddress?.name,
          email: user?.email,
          contact: shippingAddress?.phone,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      toast.error('Payment initialization failed');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress) {
      toast.error('Please provide shipping address');
      return;
    }

    if (!useSameAddress && !billingAddress) {
      toast.error('Please provide billing address');
      return;
    }

    setLoading(true);

    try {
      const orderId = await createOrder();
      if (!orderId) {
        // Error already handled in createOrder function
        return;
      }

      if (paymentMethod === 'cod') {
        // Cash on delivery - order is complete
        clearCart();
        toast.success('Order placed successfully!');
        onOrderComplete?.(orderId);
        router.push(`/checkout/success?order_id=${orderId}`);
      } else if (paymentMethod === 'razorpay') {
        await processRazorpayPayment(orderId);
      } else {
        toast.error('Payment method not implemented yet');
      }
    } catch (error) {
      console.error('Checkout error:', error);

      // Provide specific error messages
      if (error instanceof Error) {
        toast.error(`Checkout failed: ${error.message}`);
      } else {
        toast.error('Failed to process order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  if (databaseSetupError) {
    return (
      <DatabaseSetupError
        onRetry={() => {
          setDatabaseSetupError(false);
          // Retry the checkout process
          window.location.reload();
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
        <AddressForm
          address={shippingAddress}
          onChange={setShippingAddress}
          required
        />
      </div>

      {/* Billing Address */}
      <div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="same-address"
            checked={useSameAddress}
            onChange={(e) => setUseSameAddress(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="same-address" className="ml-2 text-sm text-gray-700">
            Billing address same as shipping address
          </label>
        </div>
        
        {!useSameAddress && (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
            <AddressForm
              address={billingAddress}
              onChange={setBillingAddress}
              required={!useSameAddress}
            />
          </>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        {availablePaymentMethods.length === 0 && !codEnabled ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Payment Methods Available</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>No payment methods are currently enabled. Please contact the administrator to enable payment options.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
            availableMethods={availablePaymentMethods}
            codEnabled={codEnabled}
          />
        )}
      </div>

      {/* Order Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Order Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any special instructions for your order..."
        />
      </div>

      {/* Order Summary */}
      <OrderSummary
        items={items}
        totals={calculateTotals()}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || (availablePaymentMethods.length === 0 && !codEnabled)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' :
         (availablePaymentMethods.length === 0 && !codEnabled) ? 'No Payment Methods Available' :
         paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
      </button>
    </form>
  );
}
