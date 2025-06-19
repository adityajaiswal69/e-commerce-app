"use client";

import { useState } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface DatabaseSetupErrorProps {
  onRetry?: () => void;
}

export default function DatabaseSetupError({ onRetry }: DatabaseSetupErrorProps) {
  const [copied, setCopied] = useState(false);

  const setupScript = `-- Simple Payment System Setup for Uniformat E-commerce
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own orders" ON orders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT ON order_items TO authenticated;`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(setupScript);
      setCopied(true);
      toast.success('Setup script copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Database Setup Required
            </h3>
            <p className="text-red-700 mb-4">
              The payment system tables are not set up in your database. Please run the setup script to enable checkout functionality.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">Quick Setup Instructions</h4>
        <ol className="list-decimal list-inside space-y-3 text-blue-700">
          <li>
            <strong>Open your Supabase Dashboard</strong>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center ml-2 text-blue-600 hover:text-blue-800"
            >
              Open Dashboard <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
            </a>
          </li>
          <li><strong>Navigate to your project</strong> and go to the <strong>SQL Editor</strong></li>
          <li><strong>Copy the setup script</strong> using the button below</li>
          <li><strong>Paste the script</strong> into the SQL Editor</li>
          <li><strong>Click "Run"</strong> to execute the script</li>
          <li><strong>Refresh this page</strong> to test the checkout system</li>
        </ol>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Database Setup Script</h4>
          <button
            onClick={copyToClipboard}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              copied 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              'Copy Script'
            )}
          </button>
        </div>
        
        <div className="bg-white border rounded-md p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {setupScript}
          </pre>
        </div>
      </div>

      <div className="flex gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Test Database Setup
          </button>
        )}
        
        <a
          href="/debug/database"
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Check Database Status
        </a>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h5 className="font-medium text-yellow-800 mb-2">Need Help?</h5>
        <p className="text-yellow-700 text-sm">
          If you're having trouble with the setup, check the{' '}
          <a href="/debug/database" className="underline hover:text-yellow-900">
            database status page
          </a>{' '}
          for detailed error information, or contact support for assistance.
        </p>
      </div>
    </div>
  );
}
