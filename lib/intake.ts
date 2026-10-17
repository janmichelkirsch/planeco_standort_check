import "server-only";
import type { IntakeRow } from "@/lib/intake-row";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Eingang einer Anfrage (`incoming_submissions`) und seine Verarbeitung (`process_intake` in SQL).
 * Spezifikation v3, §5.2 und §6.
 */

/**
 * Speichert den Eingang. Gibt es die `client_request_id` schon (Doppelklick, Netz-Retry),
 * wird kein zweiter angelegt, sondern der vorhandene zurückgegeben (`created: false`).
 */
export async function storeIntake(row: IntakeRow): Promise<{ id: string; created: boolean }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("incoming_submissions")
    .upsert(row, { onConflict: "client_request_id", ignoreDuplicates: true })
    .select("id");
  if (error) throw error;
  if (data.length > 0) return { id: data[0].id, created: true };

  const existing = await supabase
    .from("incoming_submissions")
    .select("id")
    .eq("client_request_id", row.client_request_id)
    .single();
  if (existing.error) throw existing.error;
  return { id: existing.data.id, created: false };
}

/**
 * Ordnet den Eingang einem Kontakt zu (oder schickt ihn in die Prüfliste). Wirft nie:
 * Bei einem Fehler wird der Eingang als `failed` markiert und kann im Dashboard erneut verarbeitet werden.
 */
export async function processIntake(intakeId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase.rpc("process_intake", { p_intake_id: intakeId });
    if (error) throw error;
    console.info(`[intake] ${intakeId} → ${data}`);
  } catch (error) {
    // Supabase liefert Fehler als Objekt mit `message`, nicht immer als Error-Instanz.
    const reason =
      typeof error === "object" && error !== null && "message" in error ? String(error.message) : String(error);
    console.error(`[intake] Verarbeitung von ${intakeId} fehlgeschlagen:`, reason);
    const { error: markError } = await supabase.rpc("mark_intake_failed", { p_intake_id: intakeId, p_error: reason });
    if (markError) console.error(`[intake] Fehlerstatus für ${intakeId} nicht gespeichert`, markError);
  }
}
