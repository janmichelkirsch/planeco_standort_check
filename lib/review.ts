import type { TrackingFields } from "@/lib/channel";

/**
 * Prüfliste ohne Datenbank: Kandidaten mit Verlauf, Formular der Entscheidung, Rückmeldungen.
 * Spezifikation v3, §7.1. Die Daten lädt `lib/review-data.ts`.
 */

/** Ergebnis von `intake_candidates()` in SQL. */
export type Candidate = {
  contact_id: string;
  first_name: string;
  last_name: string;
  account_owner_id: string | null;
  owner_name: string | null;
  email_match: boolean;
  phone_match: boolean;
  name_match: boolean;
};

export type CandidateHistory = { count: number; latestAt: string; latestAddress: string };

/** Bekannte Mails und Telefonnummern eines Kandidaten (alle, nicht nur die passende). */
export type CandidateMethods = { emails: string[]; phones: string[] };

export type ReviewCase = {
  id: string;
  receivedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  /** Herkunft aus dem Payload, für die Anzeige über `originOf` (gleich wie an der Anfrage). */
  tracking: TrackingFields;
  candidates: (Candidate & { history: CandidateHistory | null; methods: CandidateMethods })[];
};

type MethodRow = { contact_id: string; type: string; normalized_value: string };

/** Mails und Telefonnummern je Kontakt, sortiert und ohne Doppelungen. */
export function groupMethods(rows: MethodRow[]): Map<string, CandidateMethods> {
  const result = new Map<string, CandidateMethods>();
  for (const row of rows) {
    const entry = result.get(row.contact_id) ?? { emails: [], phones: [] };
    const list = row.type === "email" ? entry.emails : row.type === "phone" ? entry.phones : null;
    if (list && !list.includes(row.normalized_value)) list.push(row.normalized_value);
    result.set(row.contact_id, entry);
  }
  for (const entry of result.values()) {
    entry.emails.sort();
    entry.phones.sort();
  }
  return result;
}

type HistoryRow = { contact_id: string; created_at: string; street: string; house_number: string; postal_code: string; city: string };

/** Bisherige Anfragen je Kontakt: Anzahl und neueste Adresse – hilft zu erkennen, ob es dieselbe Person ist. */
export function summarizeHistory(rows: HistoryRow[]): Map<string, CandidateHistory> {
  const result = new Map<string, CandidateHistory>();
  for (const row of rows) {
    const current = result.get(row.contact_id);
    const address = `${row.street} ${row.house_number}, ${row.postal_code} ${row.city}`;
    if (!current) {
      result.set(row.contact_id, { count: 1, latestAt: row.created_at, latestAddress: address });
    } else {
      current.count += 1;
      if (row.created_at > current.latestAt) {
        current.latestAt = row.created_at;
        current.latestAddress = address;
      }
    }
  }
  return result;
}

const text = (payload: Record<string, unknown>, key: string) => {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : "";
};

/** Baut einen Prüffall aus dem gespeicherten Eingang. */
export function toReviewCase(
  intake: { id: string; received_at: string; payload: Record<string, unknown>; normalized_email: string; normalized_phone: string },
  candidates: Candidate[],
  history: Map<string, CandidateHistory>,
  methods: Map<string, CandidateMethods> = new Map(),
): ReviewCase {
  const p = intake.payload;
  const orNull = (key: string) => text(p, key) || null;
  return {
    id: intake.id,
    receivedAt: intake.received_at,
    firstName: text(p, "firstName"),
    lastName: text(p, "lastName"),
    email: intake.normalized_email,
    phone: intake.normalized_phone,
    address: `${text(p, "street")} ${text(p, "houseNumber")}, ${text(p, "postalCode")} ${text(p, "city")}`,
    tracking: {
      utm_source: orNull("utmSource"),
      utm_medium: orNull("utmMedium"),
      utm_campaign: orNull("utmCampaign"),
      gclid: orNull("gclid"),
      fbclid: orNull("fbclid"),
      referrer: orNull("referrer"),
    },
    candidates: candidates.map((c) => ({
      ...c,
      history: history.get(c.contact_id) ?? null,
      methods: methods.get(c.contact_id) ?? { emails: [], phones: [] },
    })),
  };
}

export type ResolveRequest =
  | { intakeId: string; action: "attach_existing"; contactId: string; firstName: string | null; lastName: string | null }
  | { intakeId: string; action: "create_new" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type FormLike = { get(name: string): FormDataEntryValue | null };
const field = (form: FormLike, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

/**
 * Liest die Entscheidung aus dem Formular. `null` bei ungültigen Werten.
 * Beim Zuordnen mit „Name übernehmen“ wird der eingegebene Name zum Kontaktnamen; sonst bleibt er unverändert.
 */
export function parseResolveForm(form: FormLike): ResolveRequest | null {
  const intakeId = field(form, "intakeId");
  if (!UUID.test(intakeId)) return null;

  const action = field(form, "action");
  if (action === "create_new") return { intakeId, action };
  if (action !== "attach_existing") return null;

  const contactId = field(form, "contactId");
  if (!UUID.test(contactId)) return null;

  if (field(form, "name") !== "take") return { intakeId, action, contactId, firstName: null, lastName: null };
  const firstName = field(form, "firstName");
  const lastName = field(form, "lastName");
  if (!firstName || !lastName || firstName.length > 200 || lastName.length > 200) return null;
  return { intakeId, action, contactId, firstName, lastName };
}

export const RESULT_MESSAGES = {
  attached: { tone: "ok", text: "Anfrage dem Kontakt zugeordnet." },
  created: { tone: "ok", text: "Neuer Kontakt angelegt. Er steht im Dashboard unter „Nicht zugewiesen“." },
  conflict: { tone: "warn", text: "Diese Anfrage wurde gerade schon von jemand anderem bearbeitet. Die Liste ist aktualisiert." },
  forbidden: { tone: "error", text: "Dein Login ist keinem Team-Mitglied zugeordnet. Bitte in team_members eintragen." },
  invalid: { tone: "error", text: "Die Auswahl war unvollständig. Bitte noch einmal versuchen." },
  error: { tone: "error", text: "Speichern fehlgeschlagen. Bitte noch einmal versuchen." },
} as const;

export type ResultKey = keyof typeof RESULT_MESSAGES;

/** Fehlercodes aus `resolve_intake_review` (siehe supabase/004) → Rückmeldung. */
export function resultForErrorCode(code: string | undefined): ResultKey {
  if (code === "P0409") return "conflict";
  if (code === "P0401") return "forbidden";
  if (code === "P0404" || code === "P0422") return "invalid";
  return "error";
}
