import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");
  const error_code = requestUrl.searchParams.get("error_code");
  const type = requestUrl.searchParams.get("type");

  console.log("Auth callback received:", {
    code: code ? "present" : "missing",
    error,
    error_description,
    error_code,
    type,
    url: requestUrl.href
  });

  // Handle specific error cases
  if (error) {
    let redirectUrl = "/sign-in";
    let errorMessage = error_description || "An error occurred";

    // Handle specific error cases
    if (error === "access_denied" && error_code === "otp_expired") {
      redirectUrl = "/reset-password";
      errorMessage = "The password reset link has expired. Please request a new one.";
    } else if (error === "access_denied") {
      redirectUrl = "/reset-password";
      errorMessage = "The password reset link is invalid or has been used. Please request a new one.";
    }

    return NextResponse.redirect(
      new URL(
        `${redirectUrl}?error=${encodeURIComponent(errorMessage)}`,
        requestUrl.origin
      )
    );
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        throw exchangeError;
      }

      console.log("Code exchange successful:", {
        userId: data.user?.id,
        email: data.user?.email,
        type
      });

      // Check if this is a password recovery flow
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/auth/update-password", requestUrl.origin));
      }

      // Default redirect for other auth flows
      return NextResponse.redirect(new URL("/", requestUrl.origin));
    } catch (error) {
      console.error("Auth callback error:", error);

      // Provide more specific error messages
      let errorMessage = "Invalid or expired link";
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          errorMessage = "The link has expired. Please request a new password reset.";
        } else if (error.message.includes("invalid")) {
          errorMessage = "The link is invalid. Please request a new password reset.";
        }
      }

      return NextResponse.redirect(
        new URL(
          `/reset-password?error=${encodeURIComponent(errorMessage)}`,
          requestUrl.origin
        )
      );
    }
  }

  // No code or error, redirect to sign-in
  console.log("No code or error found, redirecting to sign-in");
  return NextResponse.redirect(new URL("/sign-in", requestUrl.origin));
}
