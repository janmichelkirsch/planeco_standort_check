"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireSalesUser } from "@/lib/auth";
import {
  dashboardResultForError,
  parseClaimForm,
  parseContactForm,
  parseSubmissionForm,
  returnUrl,
  type DashboardResult,
} from "@/lib/dashboard-forms";
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

// ─── Bearbeiten im Dashboard (Spezifikation v3, §8) ──────────────────────────
// Alle Änderungen laufen über die Datenbankfunktionen aus supabase/004 mit dem Session-Client:
// Sie prüfen selbst, ob der Nutzer ein Team-Mitglied ist. Direkte UPDATEs sind für eingeloggte Nutzer gesperrt.

type RpcError = { code?: string; message: string } | null;

function logRpcError(where: string, error: RpcError) {
  if (error) console.error(`[admin] ${where} fehlgeschlagen`, error.code, error.message);
}

/** „Übernehmen“: setzt den eigenen Namen als Zuständigen, nur wenn noch niemand zuständig ist. */
export async function claimContact(formData: FormData) {
  const { supabase, userId } = await requireSalesUser();
  const request = parseClaimForm(formData);
  if (!request) redirect(returnUrl(formData, "invalid"));

  const { data: owner, error } = await supabase.rpc("claim_contact", { p_contact_id: request.contactId });
  logRpcError("Übernehmen", error);
  let result: DashboardResult = error ? dashboardResultForError(error.code) : "claimed";
  if (!error) {
    const { data: me } = await supabase.from("team_members").select("id").eq("auth_user_id", userId).maybeSingle();
    if (owner !== me?.id) result = "claim_lost";
  }
  redirect(returnUrl(formData, result, request.contactId));
}

/** Zuständigen ändern/freigeben und Kontaktnamen korrigieren. */
export async function updateContact(formData: FormData) {
  const { supabase } = await requireSalesUser();
  const changes = parseContactForm(formData);
  if (!changes) redirect(returnUrl(formData, "invalid"));

  let error: RpcError = null;
  if (changes.owner !== undefined) {
    ({ error } = await supabase.rpc("set_contact_owner", { p_contact_id: changes.contactId, p_owner_id: changes.owner }));
    logRpcError("Zuständigen ändern", error);
  }
  if (!error && changes.name) {
    ({ error } = await supabase.rpc("update_contact_name", {
      p_contact_id: changes.contactId,
      p_first_name: changes.name.first,
      p_last_name: changes.name.last,
    }));
    logRpcError("Namen ändern", error);
  }
  const changed = changes.owner !== undefined || changes.name !== undefined;
  redirect(returnUrl(formData, error ? dashboardResultForError(error.code) : changed ? "saved" : "unchanged", changes.contactId));
}

/** Status, Ergebnis und abweichenden Bearbeiter einer Anfrage speichern. */
export async function updateSubmission(formData: FormData) {
  const { supabase } = await requireSalesUser();
  const changes = parseSubmissionForm(formData);
  if (!changes) redirect(returnUrl(formData, "invalid"));

  const calls: [string, string, Record<string, unknown>][] = [];
  if (changes.status !== undefined) {
    calls.push(["Status", "set_submission_status", { p_submission_id: changes.submissionId, p_status: changes.status }]);
  }
  if (changes.outcome !== undefined) {
    calls.push(["Ergebnis", "set_submission_outcome", { p_submission_id: changes.submissionId, p_outcome: changes.outcome }]);
  }
  if (changes.override !== undefined) {
    calls.push(["Bearbeiter", "set_submission_override", { p_submission_id: changes.submissionId, p_team_member_id: changes.override }]);
  }

  let error: RpcError = null;
  for (const [label, fn, args] of calls) {
    ({ error } = await supabase.rpc(fn, args));
    logRpcError(label, error);
    if (error) break;
  }
  redirect(returnUrl(formData, error ? dashboardResultForError(error.code) : calls.length ? "saved" : "unchanged", changes.contactId));
}
