import Image from "next/image";
import Link from "next/link";

type RecentOrdersProps = {
  orders: Array<{
    id: string;
    created_at: string;
    total_price: number;
    status: string;
    order_items: Array<{
      quantity: number;
      product: {
        name: string;
        image_url: string;
      };
    }>;
  }>;
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
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
                <p className="font-medium">${order.total_price.toFixed(2)}</p>
                <p className="text-sm capitalize text-gray-500">
                  {order.status}
                </p>
              </div>
            </div>

            <div className="flex -space-x-4">
              {order.order_items.map((item, index) => (
                <div
                  key={index}
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
