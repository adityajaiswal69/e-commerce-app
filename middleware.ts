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
  if (req.nextUrl.pathname.startsWith("/profile")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // Design routes - require authentication
  if (req.nextUrl.pathname.startsWith("/design") || req.nextUrl.pathname.startsWith("/my-designs")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // Admin routes - check for admin role
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Auth routes - redirect to homepage if already authenticated
  if (
    session &&
    (req.nextUrl.pathname.startsWith("/sign-in") ||
      req.nextUrl.pathname.startsWith("/sign-up") ||
      req.nextUrl.pathname.startsWith("/reset-password"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
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
    "/admin/:path*",
    "/profile/:path*",
    "/design/:path*",
    "/my-designs/:path*",
    "/sign-in",
    "/sign-up",
    "/reset-password",
    "/auth/update-password",
    "/auth/callback",
    "/auth/verify-email",
  ],
};
