import { createServerSupabaseClient } from "@/lib/supabase/server";
import PaymentSettingsForm from "@/components/admin/PaymentSettingsForm";

export default async function PaymentSettingsPage() {
  const supabase = createServerSupabaseClient();

  const { data: paymentSettings } = await supabase
    .from("payment_settings")
    .select("*")
    .order("provider");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure payment gateways for your e-commerce store
        </p>
      </div>

      <PaymentSettingsForm initialSettings={paymentSettings || []} />
    </div>
  );
}
