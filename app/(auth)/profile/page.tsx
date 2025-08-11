import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProfileInfo from "@/components/profile/ProfileInfo";

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Profile</h1>

      <ProfileInfo user={user} />
    </div>
  );
}
