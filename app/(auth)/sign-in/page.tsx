"use client";

import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Sign In</h1>
      <SignInForm />
    </div>
  );
}
