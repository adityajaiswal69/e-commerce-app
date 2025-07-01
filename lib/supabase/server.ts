
// This file should only be used in the app/ directory (server components, route handlers, etc)
// Do NOT import this in pages/ or client components.
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * Use this only in server components, route handlers, or app directory files.
 * Do NOT use in pages/ directory or client components.
 */
export function createServerSupabaseClient() {
  return createServerComponentClient({ cookies });
}
