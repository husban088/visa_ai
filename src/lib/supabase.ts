import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/** Returns a shared Supabase client, or null if it isn't configured. */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  client = url && key ? createClient(url, key) : null;
  return client;
}
