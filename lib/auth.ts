import "server-only";
import { redirect } from "next/navigation";
import { getSupabaseSession } from "@/lib/supabase/session";

/**
 * Zweite Schutzschicht nach proxy.ts: prüft den Login direkt dort, wo Daten geladen werden.
 * Gibt den Supabase-Client und die E-Mail des Nutzers zurück oder leitet zum Login um.
 */
export async function requireSalesUser() {
  const supabase = await getSupabaseSession();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/login");
  }
  return { supabase, email: String(data.claims.email ?? "") };
}
