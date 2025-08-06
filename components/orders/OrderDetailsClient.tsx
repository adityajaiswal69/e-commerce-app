"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase/client";
import { Order, OrderItem, CancellationRequest, CancellationReason } from "@/types/payment.types";
import CancelOrderModal from "./CancelOrderModal";
import { formatDate, formatCurrency } from "@/lib/utils/format";

interface OrderDetailsClientProps {
  order: Order & { order_items: (OrderItem & { products: any })[] };
  orderId: string;
}

export default function OrderDetailsClient({
  order,
  orderId
}: OrderDetailsClientProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationRequest, setCancellationRequest] = useState<CancellationRequest | null>(null);
  const [cancellationReasons, setCancellationReasons] = useState<CancellationReason[]>([]);
  const [loadingCancellationData, setLoadingCancellationData] = useState(true);
  const supabase = createClientComponentClient();

  // Fallback reasons if database tables don't exist
  const fallbackReasons: CancellationReason[] = [
    {
      id: '1',
      reason: 'delivery_delay',
      description: 'The delivery is taking longer than expected',
      is_active: true,
      display_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      reason: 'no_longer_needed',
      description: 'I no longer need the product',
      is_active: true,
      display_order: 2,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      reason: 'change_of_mind',
      description: 'I changed my mind about the purchase',
      is_active: true,
      display_order: 3,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      reason: 'purchased_elsewhere',
      description: 'I have already bought the product from another source due to urgency',
      is_active: true,
      display_order: 4,
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      reason: 'time_sensitive_requirement',
      description: 'The product was for a specific occasion, which has now passed',
      is_active: true,
      display_order: 5,
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      reason: 'other',
      description: 'Other reason (please specify)',
      is_active: true,
      display_order: 6,
      created_at: new Date().toISOString()
    }
  ];

  // Fetch cancellation data
  useEffect(() => {
    async function fetchCancellationData() {
      try {
        setLoadingCancellationData(true);

        // Try to fetch cancellation request
        let cancelRequest = null;
        try {
          const { data, error: cancelError } = await supabase
            .from('cancellation_requests')
            .select('*')
            .eq('order_id', orderId)
            .single();

          if (cancelError && cancelError.code !== 'PGRST116') {
            // PGRST116 means no rows found, which is normal
            if (!(cancelError.message?.includes('relation') && cancelError.message?.includes('does not exist'))) {
              console.warn('Error fetching cancellation request:', cancelError.message);
            }
          } else {
            cancelRequest = data;
          }
        } catch (err) {
          // Table doesn't exist - this is fine, we'll use fallback mode
        }

        // Try to fetch cancellation reasons
        let reasons = fallbackReasons;
        try {
          const { data, error: reasonsError } = await supabase
            .from('cancellation_reasons')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

          if (reasonsError) {
            if (!(reasonsError.message?.includes('relation') && reasonsError.message?.includes('does not exist'))) {
              console.warn('Error fetching cancellation reasons:', reasonsError.message);
            }
          } else if (data && data.length > 0) {
            reasons = data;
          }
        } catch (err) {
          // Table doesn't exist - use fallback reasons
        }

        setCancellationRequest(cancelRequest);
        setCancellationReasons(reasons);
      } catch (err: any) {
        console.error('Error in cancellation data fetch:', err);
        // Still provide fallback data even on error
        setCancellationReasons(fallbackReasons);
      } finally {
        setLoadingCancellationData(false);
      }
    }

    fetchCancellationData();
  }, [orderId, supabase]);

  // Function to refresh cancellation data after successful submission
  const refreshCancellationData = async () => {
    try {
      const { data, error } = await supabase
        .from('cancellation_requests')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error refreshing cancellation request:', error.message);
      } else {
        setCancellationRequest(data);
      }
    } catch (err) {
      console.warn('Could not refresh cancellation data');
    }
  };

  // Check if order can be cancelled
  const canCancel = !cancellationRequest && 
    ['pending', 'confirmed', 'processing'].includes(order.status) &&
    order.payment_status !== 'refunded';

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      case 'partially_refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-sm text-gray-600 mt-1">
                Order #{order.order_number || order.id.slice(0, 8)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {order.payment_method || 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
              <p className="mt-1 text-sm text-gray-900 font-semibold">
                {formatCurrency(order.total_amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Request Status */}
        {cancellationRequest && (
          <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Cancellation Request {cancellationRequest.status.charAt(0).toUpperCase() + cancellationRequest.status.slice(1)}
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Reason: {cancellationRequest.reason}</p>
                  {cancellationRequest.additional_details && (
                    <p>Details: {cancellationRequest.additional_details}</p>
                  )}
                  {cancellationRequest.admin_notes && (
                    <p>Admin Notes: {cancellationRequest.admin_notes}</p>
                  )}
                  <p>Requested on: {formatDate(cancellationRequest.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.order_items?.map((item, index) => {
              const product = item.products || item.product_snapshot;
              const productName = product?.name || `Product ${index + 1}`;
              const productImage = product?.image_url || '/placeholder-image.svg';
              
              return (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <Image
                        src={productImage}
                        alt={productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {productName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Unit Price: {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">{formatCurrency(order.shipping_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-base font-medium">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
            <div className="text-sm text-gray-600">
              <p>{order.shipping_address.name}</p>
              <p>{order.shipping_address.address}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}</p>
              <p>{order.shipping_address.country}</p>
              {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
            </div>
          </div>
        )}

        {/* Order Notes */}
        {order.notes && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order Notes</h3>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <Link
              href="/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Orders
            </Link>
            <div className="flex space-x-3">
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel Order
                </button>
              )}
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <CancelOrderModal
          order={order}
          cancellationReasons={cancellationReasons}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            setShowCancelModal(false);
            refreshCancellationData(); // Refresh cancellation data
          }}
        />
      )}
    </>
  );
}
