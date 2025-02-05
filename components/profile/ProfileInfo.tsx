"use client";

import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function ProfileInfo({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(data?.role === "admin");
    }

    checkAdminStatus();
  }, [user.id]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setMessage("Password reset link sent to your email");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-medium">Account Information</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="font-medium">{user.email}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Member Since</label>
          <p className="font-medium">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>

        {message && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-500">
            {message}
          </div>
        )}

        <div className="space-y-2 pt-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="block w-full rounded-md bg-gray-800 px-4 py-2 text-center text-sm text-white hover:bg-gray-900"
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Change Password
          </button>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
