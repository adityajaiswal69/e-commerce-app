"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { Address } from "@/types/payment.types";

type SavedAddress = Address & {
  id: string;
  label?: "Home" | "Office" | "Other" | "Custom";
  is_default_shipping?: boolean;
  is_default_billing?: boolean;
};

interface Props {
  type: "shipping" | "billing";
  onSelect: (address: Address | null) => void;
}

export default function SavedAddressSelector({ type, onSelect }: Props) {
  const supabase = createClientComponentClient();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("user_addresses").select("*").order("created_at", { ascending: false });
      const rows = (data as any[]) || [];
      setAddresses(rows as SavedAddress[]);
      const def = rows.find((a) => (type === "shipping" ? a.is_default_shipping : a.is_default_billing));
      if (def) {
        setSelectedId(def.id);
        onSelect({
          name: def.name,
          phone: def.phone,
          address_line_1: def.address_line_1,
          address_line_2: def.address_line_2,
          city: def.city,
          state: def.state,
          postal_code: def.postal_code,
          country: def.country,
        });
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleChange = (id: string) => {
    setSelectedId(id);
    const a = addresses.find((x) => x.id === id) || null;
    if (!a) return onSelect(null);
    onSelect({
      name: a.name,
      phone: a.phone,
      address_line_1: a.address_line_1,
      address_line_2: a.address_line_2,
      city: a.city,
      state: a.state,
      postal_code: a.postal_code,
      country: a.country,
    });
  };

  if (addresses.length === 0) return null;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Select Saved {type === "shipping" ? "Shipping" : "Billing"} Address</label>
      <select
        value={selectedId}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
      >
        <option value="">Choose an address</option>
        {addresses.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label || "Home"} • {a.address_line_1}, {a.city}
          </option>
        ))}
      </select>
    </div>
  );
}

