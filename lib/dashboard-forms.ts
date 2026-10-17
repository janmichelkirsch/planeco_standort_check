import { parseDashboardParams, type Outcome, type SubmissionStatus } from "@/lib/dashboard";

/**
 * Formulare des Dashboards ohne Datenbank (Spezifikation v3, §8): Übernehmen, Kontakt bearbeiten, Anfrage bearbeiten.
 * Geprüft wird alles, was aus dem Browser kommt; die Datenbankfunktionen prüfen zusätzlich.
 */

type FormLike = { get(name: string): FormDataEntryValue | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES: SubmissionStatus[] = ["open", "contacted", "completed"];
const OUTCOMES: Outcome[] = ["qualified", "not_qualified", "unreachable"];

const field = (form: FormLike, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

/** "" = niemand; sonst eine UUID. `undefined` bei ungültigem Wert. */
const optionalId = (value: string): string | null | undefined => (value === "" ? null : UUID.test(value) ? value : undefined);

/** Zurück zur selben Ansicht, den bearbeiteten Kontakt aufgeklappt. Nur aus geprüften Werten gebaut (kein offener Redirect). */
export function returnUrl(form: FormLike, result: DashboardResult, contactId?: string): string {
  const { view, sort } = parseDashboardParams({ view: field(form, "view"), sort: field(form, "sort"), dir: field(form, "dir") });
  const params = new URLSearchParams({ view, sort: sort.column, dir: sort.direction, result });
  if (contactId && UUID.test(contactId)) params.set("open", contactId);
  return `/admin?${params}${contactId && UUID.test(contactId) ? `#kontakt-${contactId}` : ""}`;
}

export function parseClaimForm(form: FormLike): { contactId: string } | null {
  const contactId = field(form, "contactId");
  return UUID.test(contactId) ? { contactId } : null;
}

export type ContactChanges = { contactId: string; owner?: string | null; name?: { first: string; last: string } };

/** Nur, was sich gegenüber den mitgeschickten bisherigen Werten geändert hat. */
export function parseContactForm(form: FormLike): ContactChanges | null {
  const contactId = field(form, "contactId");
  if (!UUID.test(contactId)) return null;
  const owner = optionalId(field(form, "ownerId"));
  const before = optionalId(field(form, "ownerIdBefore"));
  if (owner === undefined || before === undefined) return null;

  const first = field(form, "firstName");
  const last = field(form, "lastName");
  if (!first || !last || first.length > 200 || last.length > 200) return null;

  const changes: ContactChanges = { contactId };
  if (owner !== before) changes.owner = owner;
  if (first !== field(form, "firstNameBefore") || last !== field(form, "lastNameBefore")) changes.name = { first, last };
  return changes;
}

export type SubmissionChanges = {
  submissionId: string;
  contactId: string;
  status?: SubmissionStatus;
  outcome?: Outcome | null;
  override?: string | null;
};

export function parseSubmissionForm(form: FormLike): SubmissionChanges | null {
  const submissionId = field(form, "submissionId");
  const contactId = field(form, "contactId");
  if (!UUID.test(submissionId) || !UUID.test(contactId)) return null;

  const status = field(form, "status") as SubmissionStatus;
  if (!STATUSES.includes(status)) return null;
  const outcomeRaw = field(form, "outcome");
  const outcome = outcomeRaw === "" ? null : (outcomeRaw as Outcome);
  if (outcome !== null && !OUTCOMES.includes(outcome)) return null;
  const override = optionalId(field(form, "override"));
  if (override === undefined) return null;

  const changes: SubmissionChanges = { submissionId, contactId };
  if (status !== field(form, "statusBefore")) changes.status = status;
  if ((outcome ?? "") !== field(form, "outcomeBefore")) changes.outcome = outcome;
  if ((override ?? "") !== field(form, "overrideBefore")) changes.override = override;
  return changes;
}

export const DASHBOARD_RESULTS = {
  claimed: { tone: "ok", text: "Kontakt übernommen. Neue Anfragen dieser Person landen automatisch bei dir." },
  claim_lost: { tone: "warn", text: "Jemand anderes war schneller und hat den Kontakt bereits übernommen." },
  saved: { tone: "ok", text: "Gespeichert." },
  unchanged: { tone: "ok", text: "Keine Änderung." },
  forbidden: { tone: "error", text: "Dein Login ist keinem Team-Mitglied zugeordnet. Bitte in team_members eintragen." },
  invalid: { tone: "error", text: "Die Eingabe war unvollständig oder ungültig." },
  error: { tone: "error", text: "Speichern fehlgeschlagen. Bitte noch einmal versuchen." },
  reprocessed: { tone: "ok", text: "Erneut verarbeitet." },
} as const;

export type DashboardResult = keyof typeof DASHBOARD_RESULTS;

export function dashboardResultForError(code: string | undefined): DashboardResult {
  if (code === "P0401") return "forbidden";
  if (code === "P0404" || code === "P0422") return "invalid";
  return "error";
}
