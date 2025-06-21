import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { toast } from "react-hot-toast";
import type { Order } from "@/types/orders";

// Type for product info that can come from either products relation or product_snapshot
type ProductInfo = {
  id?: string;
  name?: string;
  image_url?: string;
  image?: string;
};

type OrderDetailsProps = {
  order: Order;
  onUpdate: () => void;
  onClose: () => void;
};

export default function OrderDetails({
  order,
  onUpdate,
  onClose,
}: OrderDetailsProps) {
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", order.id);

      if (error) throw error;

      toast.success("Order status updated");
      onUpdate();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-left sm:mt-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Order Details
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Order ID: #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total: ₹{order.total_amount?.toFixed(2)}
                  </p>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Items</h4>
                    <div className="mt-2 space-y-2">
                      {order.order_items.map((item, index) => {
                        // Get product info from either products relation or product_snapshot
                        const productInfo = (item.products || item.product_snapshot || {}) as ProductInfo;
                        const productId = productInfo.id || `item-${index}`;
                        const productName = productInfo.name || 'Unknown Product';
                        const productImage = productInfo.image_url || productInfo.image || '/placeholder-product.jpg';

                        return (
                          <div
                            key={`${order.id}-${productId}`}
                            className="flex items-center gap-4 rounded-lg border p-2"
                          >
                            <div className="relative h-12 w-12 overflow-hidden rounded-md">
                              <Image
                                src={productImage}
                                alt={productName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {productName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} × ₹{(item.unit_price || 0).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Category: {item.category}
                              </p>
                              <p className="text-sm text-gray-500">
                                Size: {item.selected_size}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                ₹{(item.quantity * (item.unit_price || 0)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {order.shipping_address && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">
                        Shipping Address
                      </h4>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>{order.shipping_address.name}</p>
                        <p>{order.shipping_address.address}</p>
                        <p>
                          {order.shipping_address.city},{" "}
                          {order.shipping_address.state}{" "}
                          {order.shipping_address.postalCode}
                        </p>
                        <p>{order.shipping_address.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={loading || status === order.status}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
