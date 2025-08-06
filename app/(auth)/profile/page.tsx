import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import OrderHistory from "@/components/profile/OrderHistory";
import ProfileSettings from "@/components/profile/ProfileSettings";
import StylePreferences from "@/components/profile/StylePreferences";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
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

      <div className="space-y-8">
        <ProfileSettings profile={profile} />
        <StylePreferences />
        <OrderHistory orders={orders || []} />
      </div>
    </div>
  );
}
