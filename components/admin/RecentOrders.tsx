import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  image_url: string;
  price: number;
};

type OrderItem = {
  quantity: number;
  product: Product;
};

type Order = {
  id: string;
  created_at: string;
  total: number | null;
  status: string;
  order_items: OrderItem[];
};

type RecentOrdersProps = {
  orders: Order[];
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
  // Remove or comment out console.log for production
  // console.log("Orders received in component:", orders);

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-medium">Recent Orders</h2>
        <p className="mt-2 text-sm text-gray-500">No orders found</p>
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
                <p className="text-sm text-gray-500">Order #{order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${(order.total || 0).toFixed(2)}</p>
                <p className="text-sm capitalize text-gray-500">
                  {order.status}
                </p>
              </div>
            </div>

            {order.order_items && order.order_items.length > 0 && (
              <div className="flex -space-x-4">
                {order.order_items.map((item, index) => (
                  <div
                    key={`${order.id}-${index}`}
                    className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white"
                  >
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
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
