"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireSalesUser } from "@/lib/auth";
import { processIntake } from "@/lib/intake";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseSession } from "@/lib/supabase/session";

export async function logout() {
  const supabase = await getSupabaseSession();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[logout] Abmelden fehlgeschlagen", error.message);
  }
  redirect("/login");
}

/**
 * „Erneut verarbeiten“: holt Eingänge nach, deren Zuordnung abgebrochen ist (`failed` oder noch `received`).
 * Nur mit Login. Die Zuordnung selbst darf nur der Server (`process_intake` ist für eingeloggte Nutzer gesperrt),
 * daher hier mit dem Secret Key. Doppelte Verarbeitung ist ausgeschlossen (Sperre in `process_intake`).
 */
export async function reprocessIntakes() {
  await requireSalesUser();
  const { data, error } = await getSupabaseAdmin().from("incoming_submissions").select("id").in("status", ["received", "failed"]);
  if (error) {
    console.error("[admin] Offene Eingänge konnten nicht geladen werden", error);
    return;
  }
  for (const { id } of data) {
    await processIntake(id);
  }
  refresh();
}
