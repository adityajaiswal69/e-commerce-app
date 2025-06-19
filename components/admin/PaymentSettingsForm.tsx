"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PaymentSettings, PaymentProvider } from "@/types/payment.types";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface PaymentSettingsFormProps {
  initialSettings: PaymentSettings[];
}

const PAYMENT_PROVIDERS = [
  {
    id: 'razorpay' as PaymentProvider,
    name: 'Razorpay',
    description: 'Accept payments via UPI, Cards, Net Banking, and Wallets',
    logo: '/images/razorpay-logo.png',
    fields: [
      { key: 'key_id', label: 'Key ID', type: 'text', required: true },
      { key: 'key_secret', label: 'Key Secret', type: 'password', required: true },
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: false },
    ],
  },
  {
    id: 'stripe' as PaymentProvider,
    name: 'Stripe',
    description: 'Global payment processing platform',
    logo: '/images/stripe-logo.png',
    fields: [
      { key: 'publishable_key', label: 'Publishable Key', type: 'text', required: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: false },
    ],
  },
  {
    id: 'paytm' as PaymentProvider,
    name: 'Paytm',
    description: 'Popular Indian payment gateway',
    logo: '/images/paytm-logo.png',
    fields: [
      { key: 'merchant_id', label: 'Merchant ID', type: 'text', required: true },
      { key: 'merchant_key', label: 'Merchant Key', type: 'password', required: true },
      { key: 'website', label: 'Website', type: 'text', required: true },
      { key: 'industry_type', label: 'Industry Type', type: 'text', required: true },
    ],
  },
];

export default function PaymentSettingsForm({ initialSettings }: PaymentSettingsFormProps) {
  const [settings, setSettings] = useState<Record<PaymentProvider, PaymentSettings>>(
    () => {
      const settingsMap: Record<PaymentProvider, PaymentSettings> = {} as any;
      
      PAYMENT_PROVIDERS.forEach(provider => {
        const existing = initialSettings.find(s => s.provider === provider.id);
        settingsMap[provider.id] = existing || {
          id: '',
          provider: provider.id,
          is_active: false,
          is_test_mode: true,
          settings: {},
          created_at: '',
          updated_at: '',
        };
      });
      
      return settingsMap;
    }
  );

  const [loading, setLoading] = useState<Record<PaymentProvider, boolean>>({
    razorpay: false,
    stripe: false,
    paytm: false,
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const supabase = createClientComponentClient();

  const toggleSecretVisibility = (fieldKey: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const updateSetting = (provider: PaymentProvider, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: field === 'settings' ? value : value,
        ...(field !== 'settings' && field !== 'is_active' && field !== 'is_test_mode' 
          ? {
              settings: {
                ...prev[provider].settings,
                [field]: value,
              }
            }
          : {}),
      },
    }));
  };

  const saveSetting = async (provider: PaymentProvider) => {
    setLoading(prev => ({ ...prev, [provider]: true }));
    
    try {
      const setting = settings[provider];
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          provider,
          is_active: setting.is_active,
          is_test_mode: setting.is_test_mode,
          settings: setting.settings,
        }, {
          onConflict: 'provider'
        });

      if (error) throw error;

      toast.success(`${PAYMENT_PROVIDERS.find(p => p.id === provider)?.name} settings saved successfully`);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="space-y-8">
      {PAYMENT_PROVIDERS.map(provider => {
        const setting = settings[provider.id];
        const isLoading = loading[provider.id];

        return (
          <div key={provider.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {provider.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-500">{provider.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={setting.is_active}
                      onChange={(e) => updateSetting(provider.id, 'is_active', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={setting.is_test_mode}
                      onChange={(e) => updateSetting(provider.id, 'is_test_mode', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Test Mode</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.fields.map(field => {
                  const fieldKey = `${provider.id}_${field.key}`;
                  const isSecret = field.type === 'password';
                  const showSecret = showSecrets[fieldKey];

                  return (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={isSecret && !showSecret ? 'password' : 'text'}
                          value={setting.settings[field.key] || ''}
                          onChange={(e) => updateSetting(provider.id, field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          required={field.required}
                        />
                        {isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility(fieldKey)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showSecret ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => saveSetting(provider.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
