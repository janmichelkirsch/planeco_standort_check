import { isUuid, type Outcome, type SubmissionStatus } from "@/lib/dashboard";

/**
 * Eingaben der Dashboard-Actions ohne Datenbank (Spezifikation v3, §8): Übernehmen, Zuständig, Name, Anfrage bearbeiten.
 * Geprüft wird alles, was aus dem Browser kommt; die Datenbankfunktionen prüfen zusätzlich. Dazu die Rückmeldungen.
 */

const STATUSES: SubmissionStatus[] = ["open", "contacted", "completed"];
const OUTCOMES: Outcome[] = ["qualified", "not_qualified", "unreachable"];

export const DASHBOARD_RESULTS = {
  claimed: { tone: "ok", text: "Kontakt übernommen. Neue Anfragen dieser Person landen automatisch bei dir." },
  claim_lost: { tone: "warn", text: "Jemand anderes war schneller und hat den Kontakt bereits übernommen." },
  saved: { tone: "ok", text: "Gespeichert." },
  forbidden: { tone: "error", text: "Dein Login ist keinem Team-Mitglied zugeordnet. Bitte in team_members eintragen." },
  invalid: { tone: "error", text: "Die Eingabe war unvollständig oder ungültig." },
  error: { tone: "error", text: "Speichern fehlgeschlagen. Bitte noch einmal versuchen." },
  reprocessed: { tone: "ok", text: "Erneut verarbeitet." },
  assigned: { tone: "ok", text: "Zuständigkeit geändert. Neue Anfragen dieser Person landen beim neuen Zuständigen." },
  released: { tone: "ok", text: "Kontakt freigegeben. Er steht jetzt unter „Nicht zugewiesen“." },
  renamed: { tone: "ok", text: "Name gespeichert." },
} as const;

export type DashboardResult = keyof typeof DASHBOARD_RESULTS;

export function dashboardResultForError(code: string | undefined): DashboardResult {
  if (code === "P0401") return "forbidden";
  if (code === "P0404" || code === "P0422") return "invalid";
  return "error";
}

/** Rückgabe der Server Actions, die aus Client Components aufgerufen werden (kein Redirect). */
export type ActionResult = { ok: boolean; result: DashboardResult };

/** `null` = niemand (freigeben), eine UUID = Team-Mitglied, `undefined` = ungültig. */
export function checkOwnerId(value: unknown): string | null | undefined {
  if (value === null) return null;
  return isUuid(value) ? value : undefined;
}

/** Vor- und Nachname getrimmt, je 1–200 Zeichen. */
export function checkName(first: unknown, last: unknown): { first: string; last: string } | null {
  if (typeof first !== "string" || typeof last !== "string") return null;
  const f = first.trim();
  const l = last.trim();
  return f && l && f.length <= 200 && l.length <= 200 ? { first: f, last: l } : null;
}

export type SubmissionPatch = { status?: SubmissionStatus; outcome?: Outcome | null; override?: string | null };

/** Genau die Felder, die geändert werden sollen; mindestens eines, nur erlaubte Werte. Sonst `null`. */
export function checkSubmissionPatch(input: unknown): SubmissionPatch | null {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as Record<string, unknown>;
  const patch: SubmissionPatch = {};
  if ("status" in raw) {
    if (!STATUSES.includes(raw.status as SubmissionStatus)) return null;
    patch.status = raw.status as SubmissionStatus;
  }
  if ("outcome" in raw) {
    if (raw.outcome !== null && !OUTCOMES.includes(raw.outcome as Outcome)) return null;
    patch.outcome = raw.outcome as Outcome | null;
  }
  if ("override" in raw) {
    const override = checkOwnerId(raw.override);
    if (override === undefined) return null;
    patch.override = override;
  }
  return Object.keys(patch).length > 0 ? patch : null;
}
