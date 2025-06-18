"use client";

import { useRouter } from 'next/navigation';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface AuthMessageProps {
  title?: string;
  message?: string;
  redirectTo?: string;
  showSignInButton?: boolean;
}

export default function AuthMessage({
  title = "Authentication Required",
  message = "Please sign in to access this feature",
  redirectTo = "/sign-in",
  showSignInButton = true
}: AuthMessageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6">
          <LockClosedIcon className="mx-auto h-16 w-16 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {showSignInButton && (
          <button
            onClick={() => router.push(redirectTo)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}
