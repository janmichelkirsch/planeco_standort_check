import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/env";

let client: SupabaseClient | null = null;

/** Supabase-Client mit Secret Key. Nur auf dem Server verwenden – der Key umgeht RLS. */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  client = createClient(requireSupabaseEnv("SUPABASE_URL"), requireSupabaseEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
