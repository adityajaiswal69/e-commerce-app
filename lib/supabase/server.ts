
// This file should only be used in the app/ directory (server components, route handlers, etc)
// Do NOT import this in pages/ or client components.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Use this only in server components, route handlers, or app directory files.
 * Do NOT use in pages/ directory or client components.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
