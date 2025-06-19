"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface TableStatus {
  exists: boolean;
  error: any;
}

interface DatabaseStatus {
  success: boolean;
  tables: {
    orders: TableStatus;
    order_items: TableStatus;
    payment_transactions: TableStatus;
    payment_settings: TableStatus;
    products: TableStatus;
  };
  allTablesExist: boolean;
  message: string;
  setupInstructions?: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
  };
}

export default function DatabaseDebugPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/database-check');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking database:', error);
      toast.error('Failed to check database status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking database status...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to check database status</p>
          <button
            onClick={checkDatabase}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Status</h1>
        <p className="text-gray-600">Check if all required tables are set up correctly</p>
      </div>

      {/* Overall Status */}
      <div className={`p-6 rounded-lg mb-8 ${status.allTablesExist ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full mr-3 ${status.allTablesExist ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <h2 className={`text-lg font-semibold ${status.allTablesExist ? 'text-green-800' : 'text-red-800'}`}>
            {status.allTablesExist ? '✅ Database Ready' : '❌ Database Setup Required'}
          </h2>
        </div>
        <p className={`mt-2 ${status.allTablesExist ? 'text-green-700' : 'text-red-700'}`}>
          {status.message}
        </p>
      </div>

      {/* Table Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Object.entries(status.tables).map(([tableName, tableStatus]) => (
          <div key={tableName} className={`p-4 rounded-lg border ${tableStatus.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{tableName}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${tableStatus.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {tableStatus.exists ? 'EXISTS' : 'MISSING'}
              </span>
            </div>
            {tableStatus.error && (
              <div className="mt-2 text-sm text-red-600">
                <p><strong>Error:</strong> {tableStatus.error.message || 'Unknown error'}</p>
                {tableStatus.error.code && <p><strong>Code:</strong> {tableStatus.error.code}</p>}
                {tableStatus.error.details && <p><strong>Details:</strong> {tableStatus.error.details}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Setup Instructions */}
      {!status.allTablesExist && status.setupInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>{status.setupInstructions.step1}</li>
            <li>{status.setupInstructions.step2}</li>
            <li>{status.setupInstructions.step3}</li>
            <li>{status.setupInstructions.step4}</li>
            <li>{status.setupInstructions.step5}</li>
          </ol>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Quick Setup Script:</h4>
            <p className="text-sm text-gray-600 mb-2">Copy this script to your Supabase SQL Editor:</p>
            <div className="bg-white p-3 rounded border text-xs font-mono overflow-x-auto">
              <code>scripts/simple-payment-setup.sql</code>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={checkDatabase}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh Status
        </button>
        
        {status.allTablesExist && (
          <button
            onClick={() => {
              toast.success('Database is ready! You can now use the checkout system.');
              window.location.href = '/cart';
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Test Checkout
          </button>
        )}
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-gray-500">Debug Information</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(status, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
