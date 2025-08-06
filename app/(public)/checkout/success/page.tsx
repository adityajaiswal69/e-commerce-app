import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}) {
  const { session_id, order_id } = await searchParams;
  const supabase = await createServerSupabaseClient();

  // Verify the order exists and is paid
  let order = null;

  if (session_id) {
    // Stripe payment - find by session ID
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("stripe_session_id", session_id)
      .single();
    order = data;
  } else if (order_id) {
    // Other payment methods - find by order ID
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();
    order = data;
  }

  if (!order) {
    redirect("/");
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Thank you for your order!</h1>
          <p className="mt-2 text-gray-600">Your order has been successfully placed.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href={`/orders/${order.id}`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Order Details
          </a>
          <div>
            <a
              href="/products"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
