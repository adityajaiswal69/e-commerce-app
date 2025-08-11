import { createServerSupabaseClient } from "@/lib/supabase/server";
import BackgroundRemovalSettingsForm from "@/components/admin/BackgroundRemovalSettingsForm";

export default async function BackgroundRemovalSettingsPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: providers }, { data: active }] = await Promise.all([
    supabase.from("background_removal_settings").select("*").order("provider"),
    supabase.from("background_removal_active").select("*").single(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Background Removal Settings</h1>
        <p className="mt-2 text-gray-600">Configure and switch background removal providers</p>
      </div>

      <BackgroundRemovalSettingsForm initialProviders={providers || []} initialActive={active || null} />
    </div>
  );
}

