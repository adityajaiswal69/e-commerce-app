import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // Handle errors
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=${encodeURIComponent(
          error_description || "An error occurred"
        )}`,
        requestUrl.origin
      )
    );
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      await supabase.auth.exchangeCodeForSession(code);
      return NextResponse.redirect(new URL("/", requestUrl.origin));
    } catch (error) {
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=${encodeURIComponent("Invalid or expired link")}`,
          requestUrl.origin
        )
      );
    }
  }

  // No code or error, redirect to sign-in
  return NextResponse.redirect(new URL("/sign-in", requestUrl.origin));
}
