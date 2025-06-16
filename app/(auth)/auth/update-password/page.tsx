"use client";

import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Update Password</h1>
      <UpdatePasswordForm />
    </div>
  );
}
