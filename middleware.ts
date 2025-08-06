import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

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

  // Special case for update-password - allow access if user has a session (from password reset flow)
  if (req.nextUrl.pathname.startsWith("/auth/update-password")) {
    // If no session and no code parameter, redirect to sign-in
    if (!session && !req.nextUrl.searchParams.has("code")) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return supabaseResponse;
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
