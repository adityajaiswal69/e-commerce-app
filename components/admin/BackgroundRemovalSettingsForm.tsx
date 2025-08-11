"use client";

import { useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";

type ProviderKey = "removebg" | "stability";

interface ProviderRow {
  id: string;
  provider: ProviderKey;
  is_enabled: boolean;
  api_key: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ActiveRow {
  id: boolean;
  active_provider: ProviderKey;
  updated_at: string;
}

interface Props {
  initialProviders: ProviderRow[];
  initialActive: ActiveRow | null;
}

const PROVIDER_LABELS: Record<ProviderKey, string> = {
  removebg: "remove.bg",
  stability: "Stability AI",
};

export default function BackgroundRemovalSettingsForm({ initialProviders, initialActive }: Props) {
  const supabase = createClientComponentClient();
  const [providers, setProviders] = useState<Record<ProviderKey, ProviderRow>>(() => {
    const map: any = {};
    (initialProviders || []).forEach((p) => {
      map[p.provider] = p;
    });
    // Ensure both keys exist
    (Object.keys(PROVIDER_LABELS) as ProviderKey[]).forEach((key) => {
      if (!map[key]) {
        map[key] = {
          id: "",
          provider: key,
          is_enabled: false,
          api_key: "",
          settings: {},
          created_at: "",
          updated_at: "",
        } as ProviderRow;
      }
    });
    return map as Record<ProviderKey, ProviderRow>;
  });

  const [active, setActive] = useState<ProviderKey>(initialActive?.active_provider || "removebg");
  const [saving, setSaving] = useState(false);
  const [savingProvider, setSavingProvider] = useState<Record<ProviderKey, boolean>>({ removebg: false, stability: false });

  const enabledProviders = useMemo(
    () => (Object.values(providers).filter((p) => p.is_enabled && p.api_key.trim().length > 0).map((p) => p.provider) as ProviderKey[]),
    [providers]
  );

  const updateProviderField = (key: ProviderKey, field: keyof ProviderRow, value: any) => {
    setProviders((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const saveProvider = async (key: ProviderKey) => {
    setSavingProvider((prev) => ({ ...prev, [key]: true }));
    try {
      const row = providers[key];
      const res = await fetch('/api/admin/background-removal-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: key, is_enabled: row.is_enabled, api_key: row.api_key, settings: row.settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      toast.success(`${PROVIDER_LABELS[key]} settings saved`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save provider settings";
      toast.error(message);
    } finally {
      setSavingProvider((prev) => ({ ...prev, [key]: false }));
    }
  };

  const saveActive = async () => {
    setSaving(true);
    try {
      if (!enabledProviders.includes(active)) {
        toast.error("Selected provider must be enabled and have an API key");
        setSaving(false);
        return;
      }
      const res = await fetch('/api/admin/background-removal-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_provider: active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      toast.success("Active provider updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update active provider";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold mb-1">Provider selection</h2>
        <p className="text-sm text-gray-600 mb-4">Choose which background removal provider to use.</p>

        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">Active provider</label>
          <select
            className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={active}
            onChange={(e) => setActive(e.target.value as ProviderKey)}
          >
            {(Object.keys(PROVIDER_LABELS) as ProviderKey[]).map((key) => (
              <option key={key} value={key} disabled={!(providers[key].is_enabled && providers[key].api_key.trim())}>
                {PROVIDER_LABELS[key]} {!(providers[key].is_enabled && providers[key].api_key.trim()) ? "(disabled)" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={saveActive}
            disabled={saving}
            className="mt-3 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Save Active Provider
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(PROVIDER_LABELS) as ProviderKey[]).map((key) => (
          <div key={key} className="rounded-lg border bg-white p-6">
            <h3 className="text-base font-semibold mb-1">{PROVIDER_LABELS[key]}</h3>
            <p className="text-sm text-gray-600 mb-4">Enable and configure API key</p>

            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={providers[key].is_enabled}
                  onChange={(e) => updateProviderField(key, "is_enabled", e.target.checked)}
                />
                <span className="text-sm">Enabled</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="password"
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder={key === "removebg" ? "REMOVE_BG_API_KEY" : "STABILITY_API_KEY"}
                  value={providers[key].api_key}
                  onChange={(e) => updateProviderField(key, "api_key", e.target.value)}
                />
              </div>

              <button
                onClick={() => saveProvider(key)}
                disabled={savingProvider[key]}
                className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-white text-sm hover:bg-black disabled:opacity-50"
              >
                Save {PROVIDER_LABELS[key]}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

