import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  // Verify the order exists and is paid
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("stripe_session_id", searchParams.session_id)
    .single();

  if (!order) {
    redirect("/");
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Thank you for your order!</h1>
        <p className="mt-2 text-gray-600">Your order number is: {order.id}</p>
        {/* Add more order details */}
      </div>
    </div>
  );
}
