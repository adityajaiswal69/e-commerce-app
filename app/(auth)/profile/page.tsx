import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import OrderHistory from "@/components/profile/OrderHistory";
import ProfileInfo from "@/components/profile/ProfileInfo";

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        product:products (
          name,
          image_url
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Profile</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <ProfileInfo user={user} />
        </div>

        <div className="md:col-span-2">
          <OrderHistory orders={orders || []} />
        </div>
      </div>
    </div>
  );
}
