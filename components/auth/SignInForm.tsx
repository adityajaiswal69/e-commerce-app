"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import OAuthButtons from "./OAuthButtons";
import Link from "next/link";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const urlError = searchParams.get("error");
    const urlMessage = searchParams.get("message");

    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
    if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage));
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSignIn} className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}
        {message && <div className="text-green-500">{message}</div>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <Link
          href="/reset-password"
          className="text-blue-500 hover:text-blue-600"
        >
          Forgot your password?
        </Link>
        <Link href="/sign-up" className="text-blue-500 hover:text-blue-600">
          Create account
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <OAuthButtons />
    </div>
  );
}
