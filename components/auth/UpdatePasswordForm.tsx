"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have a session after recovery flow
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Authentication error. Please try again.");
          setTimeout(() => {
            router.push("/reset-password");
          }, 2000);
          return;
        }

        if (!session) {
          setError("Invalid or expired password reset link");
          setTimeout(() => {
            router.push("/reset-password");
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setError("Failed to verify authentication. Please try again.");
        setTimeout(() => {
          router.push("/reset-password");
        }, 2000);
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verify we still have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Session expired. Please request a new password reset link.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      // Show success message and redirect
      router.push("/sign-in?message=Password updated successfully");
    } catch (error) {
      console.error("Password update error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          New Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border p-2"
          required
          minLength={6}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !!error}
        className="w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
