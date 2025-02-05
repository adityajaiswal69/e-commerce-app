import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // Auth routes - redirect to dashboard if already authenticated
  if (
    session &&
    (req.nextUrl.pathname.startsWith("/sign-in") ||
      req.nextUrl.pathname.startsWith("/sign-up") ||
      req.nextUrl.pathname.startsWith("/reset-password"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Special case for update-password
  if (
    req.nextUrl.pathname.startsWith("/auth/update-password") &&
    !req.nextUrl.searchParams.has("code")
  ) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/reset-password",
    "/auth/update-password",
    "/auth/callback",
    "/auth/verify-email",
  ],
};
