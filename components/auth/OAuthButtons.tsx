"use client";

import { supabase } from "@/lib/supabase/client";

export default function OAuthButtons() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleGoogleSignIn}
        className="w-full rounded-md border py-2 hover:bg-gray-50"
      >
        Continue with Google
      </button>
    </div>
  );
}
