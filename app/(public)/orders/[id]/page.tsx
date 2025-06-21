import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrderDetailsClient from "@/components/orders/OrderDetailsClient";
import { Order, OrderItem } from "@/types/payment.types";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Fetch order with all related data
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (
          id,
          name,
          image_url,
          category
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only see their own orders
    .single();

  if (error || !order) {
    console.error('Error fetching order:', error);
    redirect('/orders');
  }

  // Cancellation data will be fetched client-side to avoid server errors

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrderDetailsClient
          order={order as Order & { order_items: (OrderItem & { products: any })[] }}
          orderId={id}
        />
      </div>
    </div>
  );
}
