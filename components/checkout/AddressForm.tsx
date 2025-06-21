"use client";

import { Address } from "@/types/payment.types";

interface AddressFormProps {
  address: Address | null;
  onChange: (address: Address) => void;
  required?: boolean;
}

export default function AddressForm({ address, onChange, required = false }: AddressFormProps) {
  const updateField = (field: keyof Address, value: string) => {
    onChange({
      ...address,
      [field]: value,
    } as Address);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          id="name"
          value={address?.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="tel"
          id="phone"
          value={address?.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={address?.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1 {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          id="address_line_1"
          value={address?.address_line_1 || ''}
          onChange={(e) => updateField('address_line_1', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2
        </label>
        <input
          type="text"
          id="address_line_2"
          value={address?.address_line_2 || ''}
          onChange={(e) => updateField('address_line_2', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          City {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          id="city"
          value={address?.city || ''}
          onChange={(e) => updateField('city', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
          State {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          id="state"
          value={address?.state || ''}
          onChange={(e) => updateField('state', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />
      </div>

      <div>
        <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
          Postal Code {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          id="postal_code"
          value={address?.postal_code || ''}
          onChange={(e) => updateField('postal_code', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="country"
          value={address?.country || 'India'}
          onChange={(e) => updateField('country', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        >
          <option value="India">India</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
        </select>
      </div>
    </div>
  );
}
