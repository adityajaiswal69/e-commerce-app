import Image from "next/image";
import Link from "next/link";
import type { Order } from "@/types/orders";

type RecentOrdersProps = {
  orders: Order[];
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
  // Debug logging for development
  console.log("📊 RecentOrders received:", orders?.length || 0, "orders");

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-medium">Recent Orders</h2>
        <p className="mt-2 text-sm text-gray-500">No orders found</p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">
            💡 Tip: Create some test orders to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-medium">Recent Orders</h2>
      </div>

      <div className="divide-y">
        {orders.map((order) => (
          <div key={order.id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Order #{order.order_number || order.id.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                {order.payment_status && (
                  <p className="text-xs text-gray-400 capitalize">
                    Payment: {order.payment_status}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium">₹{(order.total_amount || 0).toFixed(2)}</p>
                <p className="text-sm capitalize text-gray-500">
                  {order.status}
                </p>
              </div>
            </div>

            {order.order_items && order.order_items.length > 0 ? (
              <div className="mt-4">
                <div className="space-y-2">
                  {order.order_items.map((item, index) => {
                    // Get product info from either products relation or product_snapshot
                    const productId = item.products?.id || `snapshot-${index}`;
                    const productName = item.products?.name || item.product_snapshot?.name || 'Unknown Product';
                    const productImage = item.products?.front_image_url || item.products?.image_url || item.product_snapshot?.image_url || item.product_snapshot?.image || '/placeholder-product.jpg';

                    return (
                      <div
                        key={`${order.id}-${productId}`}
                        className="flex items-center gap-4"
                      >
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
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
                            {item.quantity} × ₹{item.unit_price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ₹{((item.quantity || 1) * (item.unit_price || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-3 p-2 bg-gray-50 rounded text-center">
                <p className="text-xs text-gray-500">No items details available</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <Link
          href="/admin/orders"
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          View All Orders →
        </Link>
      </div>
    </div>
  );
}
