"use client";

import { supabase } from "@/lib/supabase/client";

export default function OAuthButtons() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <div className="flex items-center justify-center">
        <svg
          className="mr-2 h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Google icon SVG */}
        </svg>
        Continue with Google
      </div>
    </button>
  );
}
