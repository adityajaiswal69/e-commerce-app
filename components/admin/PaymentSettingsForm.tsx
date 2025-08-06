"use client";

import { useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { PaymentSettings, PaymentProvider } from "@/types/payment.types";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface PaymentSettingsFormProps {
  initialSettings: PaymentSettings[];
}

interface PaymentField {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

interface PaymentProviderConfig {
  id: PaymentProvider;
  name: string;
  description: string;
  logo: string;
  fields?: PaymentField[];
  testFields?: PaymentField[];
  liveFields?: PaymentField[];
}

const PAYMENT_PROVIDERS: PaymentProviderConfig[] = [
  {
    id: 'razorpay' as PaymentProvider,
    name: 'Razorpay',
    description: 'Accept payments via UPI, Cards, Net Banking, and Wallets',
    logo: '/images/razorpay-logo.png',
    testFields: [
      { key: 'test_key_id', label: 'Test Key ID', type: 'text', required: true },
      { key: 'test_key_secret', label: 'Test Key Secret', type: 'password', required: true },
      { key: 'test_webhook_secret', label: 'Test Webhook Secret', type: 'password', required: false },
    ],
    liveFields: [
      { key: 'live_key_id', label: 'Live Key ID', type: 'text', required: true },
      { key: 'live_key_secret', label: 'Live Key Secret', type: 'password', required: true },
      { key: 'live_webhook_secret', label: 'Live Webhook Secret', type: 'password', required: false },
    ],
  },
  {
    id: 'stripe' as PaymentProvider,
    name: 'Stripe',
    description: 'Global payment processing platform',
    logo: '/images/stripe-logo.png',
    testFields: [
      { key: 'test_publishable_key', label: 'Test Publishable Key', type: 'text', required: true },
      { key: 'test_secret_key', label: 'Test Secret Key', type: 'password', required: true },
      { key: 'test_webhook_secret', label: 'Test Webhook Secret', type: 'password', required: false },
    ],
    liveFields: [
      { key: 'live_publishable_key', label: 'Live Publishable Key', type: 'text', required: true },
      { key: 'live_secret_key', label: 'Live Secret Key', type: 'password', required: true },
      { key: 'live_webhook_secret', label: 'Live Webhook Secret', type: 'password', required: false },
    ],
  },
  {
    id: 'paytm' as PaymentProvider,
    name: 'Paytm',
    description: 'Popular Indian payment gateway',
    logo: '/images/paytm-logo.png',
    testFields: [
      { key: 'test_merchant_id', label: 'Test Merchant ID', type: 'text', required: true },
      { key: 'test_merchant_key', label: 'Test Merchant Key', type: 'password', required: true },
      { key: 'test_website', label: 'Test Website', type: 'text', required: true },
      { key: 'test_industry_type', label: 'Test Industry Type', type: 'text', required: true },
    ],
    liveFields: [
      { key: 'live_merchant_id', label: 'Live Merchant ID', type: 'text', required: true },
      { key: 'live_merchant_key', label: 'Live Merchant Key', type: 'password', required: true },
      { key: 'live_website', label: 'Live Website', type: 'text', required: true },
      { key: 'live_industry_type', label: 'Live Industry Type', type: 'text', required: true },
    ],
  },
  {
    id: 'cod' as PaymentProvider,
    name: 'Cash on Delivery',
    description: 'Accept cash payments on delivery',
    logo: '/images/cod-logo.png',
    fields: [
      { key: 'additional_charges', label: 'Additional Charges (₹)', type: 'number', required: false },
      { key: 'description', label: 'Description', type: 'text', required: false },
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
    cod: false,
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
                <div className="flex items-center space-x-6">
                  {/* Active Toggle Switch */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 mr-3">Active</span>
                    <button
                      type="button"
                      onClick={() => updateSetting(provider.id, 'is_active', !setting.is_active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        setting.is_active ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Test Mode Toggle Switch (only show for non-COD providers) */}
                  {provider.id !== 'cod' && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700 mr-3">Test Mode</span>
                      <button
                        type="button"
                        onClick={() => updateSetting(provider.id, 'is_test_mode', !setting.is_test_mode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          setting.is_test_mode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.is_test_mode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration Fields - Only show if provider is active */}
            {setting.is_active && (
              <div className="px-6 py-4">
                {/* COD has simple fields, others have test/live separation */}
                {provider.id === 'cod' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {provider.fields?.map(field => {
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
                              type={isSecret && !showSecret ? 'password' : field.type === 'number' ? 'number' : 'text'}
                              value={setting.settings[field.key] || ''}
                              onChange={(e) => {
                                const value = field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                                updateSetting(provider.id, field.key, value);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              required={field.required}
                              min={field.type === 'number' ? 0 : undefined}
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
                ) : (
                  <div className="space-y-6">
                    {/* Test Mode Fields */}
                    <div className={`p-4 rounded-lg border-2 ${setting.is_test_mode ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center mb-4">
                        <div className={`w-3 h-3 rounded-full mr-2 ${setting.is_test_mode ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                        <h4 className="text-lg font-medium text-gray-900">Test Mode Configuration</h4>
                        {setting.is_test_mode && <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">ACTIVE</span>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {provider.testFields?.map(field => {
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
                    </div>

                    {/* Live Mode Fields */}
                    <div className={`p-4 rounded-lg border-2 ${!setting.is_test_mode ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center mb-4">
                        <div className={`w-3 h-3 rounded-full mr-2 ${!setting.is_test_mode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <h4 className="text-lg font-medium text-gray-900">Live Mode Configuration</h4>
                        {!setting.is_test_mode && <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">ACTIVE</span>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {provider.liveFields?.map(field => {
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
                    </div>
                  </div>
                )}

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
            )}

            {/* Save button for inactive providers */}
            {!setting.is_active && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => saveSetting(provider.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
