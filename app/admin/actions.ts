"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireSalesUser } from "@/lib/auth";
import {
  checkName,
  checkOwnerId,
  checkSubmissionPatch,
  dashboardResultForError,
  type ActionResult,
  type SubmissionPatch,
} from "@/lib/dashboard-forms";
import { isUuid } from "@/lib/dashboard";
import { geocodePending } from "@/lib/geocode";
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
 * „Erneut verarbeiten“: holt Eingänge nach, deren Zuordnung abgebrochen ist (`failed` oder noch `received`),
 * und schlägt Adressen nach, bei denen Photon nicht erreichbar war.
 * Nur mit Login. Die Zuordnung selbst darf nur der Server (`process_intake` ist für eingeloggte Nutzer gesperrt),
 * daher hier mit dem Secret Key. Doppelte Verarbeitung ist ausgeschlossen (Sperre in `process_intake`).
 * Aufruf aus dem Dashboard per JavaScript; Rückgabe statt Redirect.
 */
export async function reprocessIntakesAction(): Promise<ActionResult> {
  await requireSalesUser();
  const { data, error } = await getSupabaseAdmin().from("incoming_submissions").select("id").in("status", ["received", "failed"]);
  if (error) {
    console.error("[admin] Offene Eingänge konnten nicht geladen werden", error);
    return { ok: false, result: "error" };
  }
  for (const { id } of data) {
    await processIntake(id);
  }
  await geocodePending();
  refresh();
  return { ok: true, result: "reprocessed" };
}

// ─── Bearbeiten im Dashboard (Spezifikation v3, §8) ──────────────────────────
// Alle Änderungen laufen über die Datenbankfunktionen aus supabase/004 mit dem Session-Client:
// Sie prüfen selbst, ob der Nutzer ein Team-Mitglied ist. Direkte UPDATEs sind für eingeloggte Nutzer gesperrt.

type RpcError = { code?: string; message: string } | null;

function logRpcError(where: string, error: RpcError) {
  if (error) console.error(`[admin] ${where} fehlgeschlagen`, error.code, error.message);
}

// Die Prüfung im Browser ist Komfort; maßgeblich sind die Prüfungen hier und in den Datenbankfunktionen.
// Rückgabe statt Redirect, danach `refresh()`, damit die Seite die neuen Daten zeigt.

function failed(where: string, error: NonNullable<RpcError>): ActionResult {
  logRpcError(where, error);
  return { ok: false, result: dashboardResultForError(error.code) };
}

/** „Ich übernehme“. `claim_lost`, wenn in der Zwischenzeit jemand anderes übernommen hat. */
export async function claimContactAction(contactId: string): Promise<ActionResult> {
  const { supabase, userId } = await requireSalesUser();
  if (!isUuid(contactId)) return { ok: false, result: "invalid" };
  const { data: owner, error } = await supabase.rpc("claim_contact", { p_contact_id: contactId });
  if (error) return failed("Übernehmen", error);
  const { data: me } = await supabase.from("team_members").select("id").eq("auth_user_id", userId).maybeSingle();
  refresh();
  return owner === me?.id ? { ok: true, result: "claimed" } : { ok: false, result: "claim_lost" };
}

/** Zuständigen setzen oder (mit `null`) freigeben. Anfragen ohne abweichenden Bearbeiter wandern mit. */
export async function setContactOwnerAction(contactId: string, ownerId: string | null): Promise<ActionResult> {
  const { supabase } = await requireSalesUser();
  const owner = checkOwnerId(ownerId);
  if (!isUuid(contactId) || owner === undefined) return { ok: false, result: "invalid" };
  const { error } = await supabase.rpc("set_contact_owner", { p_contact_id: contactId, p_owner_id: owner });
  if (error) return failed("Zuständigen ändern", error);
  refresh();
  return { ok: true, result: owner ? "assigned" : "released" };
}

export async function renameContactAction(contactId: string, firstName: string, lastName: string): Promise<ActionResult> {
  const { supabase } = await requireSalesUser();
  const name = checkName(firstName, lastName);
  if (!isUuid(contactId) || !name) return { ok: false, result: "invalid" };
  const { error } = await supabase.rpc("update_contact_name", { p_contact_id: contactId, p_first_name: name.first, p_last_name: name.last });
  if (error) return failed("Namen ändern", error);
  refresh();
  return { ok: true, result: "renamed" };
}

/** Status, Ergebnis oder abweichenden Bearbeiter einer Anfrage speichern – nur die übergebenen Felder. */
export async function saveSubmissionAction(submissionId: string, input: SubmissionPatch): Promise<ActionResult> {
  const { supabase } = await requireSalesUser();
  const patch = checkSubmissionPatch(input);
  if (!isUuid(submissionId) || !patch) return { ok: false, result: "invalid" };

  const calls: [string, string, Record<string, unknown>][] = [];
  if (patch.status !== undefined) calls.push(["Status", "set_submission_status", { p_submission_id: submissionId, p_status: patch.status }]);
  if (patch.outcome !== undefined) calls.push(["Ergebnis", "set_submission_outcome", { p_submission_id: submissionId, p_outcome: patch.outcome }]);
  if (patch.override !== undefined)
    calls.push(["Bearbeiter", "set_submission_override", { p_submission_id: submissionId, p_team_member_id: patch.override }]);

  for (const [label, fn, args] of calls) {
    const { error } = await supabase.rpc(fn, args);
    if (error) {
      refresh();
      return failed(label, error);
    }
  }
  refresh();
  return { ok: true, result: "saved" };
}
