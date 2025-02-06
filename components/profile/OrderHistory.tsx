import Image from "next/image";
import Link from "next/link";

type OrderItem = {
  quantity: number;
  price_at_time: number | null;
  product: {
    name: string;
    image_url: string;
  };
};

type Order = {
  id: string;
  created_at: string;
  total: number | null;
  status: string;
  order_items: OrderItem[];
};

type OrderHistoryProps = {
  orders: Order[];
};

export default function OrderHistory({ orders }: OrderHistoryProps) {
  if (!orders?.length) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <h2 className="mb-4 text-lg font-medium">Order History</h2>
        <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
        <Link
          href="/products"
          className="mt-4 inline-block text-blue-500 hover:text-blue-600"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Order History</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
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

            <div className="space-y-4">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × ${(item.price_at_time || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
