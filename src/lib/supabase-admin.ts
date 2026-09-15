import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY. Uses the service role key, which can bypass row-level
 * security and manage auth users directly. Never import this file from a
 * "use client" component — it must only ever run inside API routes.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
