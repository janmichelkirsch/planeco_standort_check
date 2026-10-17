import { effectiveAssignee, type SubmissionRow, type TeamMember } from "@/lib/dashboard";
import {
  ADDRESS_SOURCE_LABEL,
  CONFIRMATION_STATUS_LABEL,
  INTAKE_STATUS_LABEL,
  MATCH_STATUS_LABEL,
  OUTCOME_LABEL,
  SUBMISSION_STATUS_LABEL,
  formatBerlinDateTime,
} from "@/lib/format";
import { SERVICE_AREA_LABEL, serviceAreaStatus } from "@/lib/service-area";

/**
 * Zeilen für den CSV-Export (Spezifikation v3, §8.4): eine Zeile pro Anfrage, dazu Eingänge,
 * die noch keine Anfrage geworden sind (in Prüfung / nicht verarbeitet) – damit im Export nichts fehlt.
 */

export const EXPORT_COLUMNS = [
  "Eingang (deutsche Zeit)",
  "Verarbeitung",
  "Kontakt-ID",
  "Kontaktname",
  "Name wie eingegeben",
  "E-Mail",
  "Telefon",
  "Straße",
  "Hausnummer",
  "PLZ",
  "Ort",
  "Gemeinde",
  "Kreis",
  "Bundesland",
  "Einzugsgebiet",
  "Breitengrad",
  "Längengrad",
  "Adressquelle",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "Landingpage",
  "Referrer",
  "Status",
  "Ergebnis",
  "Zuständig (Kontakt)",
  "Bearbeiter (Anfrage)",
  "Zuordnung",
  "Bestätigungsmail",
  "Mail gesendet am",
  "Mail-Fehler",
  "Anfrage-ID",
  "Eingangs-ID",
] as const;

type Column = (typeof EXPORT_COLUMNS)[number];
type ExportRecord = Partial<Record<Column, string | number | null | undefined>>;

const toRow = (record: ExportRecord) => EXPORT_COLUMNS.map((c) => (record[c] ?? "").toString());

export function submissionToRow(s: SubmissionRow, members: TeamMember[]): string[] {
  const name = (id: string | null) => (id ? (members.find((m) => m.id === id)?.display_name ?? "unbekannt") : "");
  return toRow({
    "Eingang (deutsche Zeit)": formatBerlinDateTime(s.created_at),
    Verarbeitung: INTAKE_STATUS_LABEL.processed,
    "Kontakt-ID": s.contact.id,
    Kontaktname: `${s.contact.first_name} ${s.contact.last_name}`,
    "Name wie eingegeben": `${s.submitted_first_name} ${s.submitted_last_name}`,
    "E-Mail": s.email.normalized_value,
    Telefon: s.phone.normalized_value,
    Straße: s.street,
    Hausnummer: s.house_number,
    PLZ: s.postal_code,
    Ort: s.city,
    Gemeinde: s.municipality,
    Kreis: s.county,
    Bundesland: s.state,
    Einzugsgebiet: SERVICE_AREA_LABEL[serviceAreaStatus(s.state)],
    Breitengrad: s.latitude,
    Längengrad: s.longitude,
    Adressquelle: ADDRESS_SOURCE_LABEL[s.address_source],
    utm_source: s.utm_source,
    utm_medium: s.utm_medium,
    utm_campaign: s.utm_campaign,
    utm_content: s.utm_content,
    utm_term: s.utm_term,
    gclid: s.gclid,
    fbclid: s.fbclid,
    Landingpage: s.landing_page,
    Referrer: s.referrer,
    Status: SUBMISSION_STATUS_LABEL[s.status],
    Ergebnis: s.outcome ? OUTCOME_LABEL[s.outcome] : "",
    "Zuständig (Kontakt)": name(s.contact.account_owner_id) || "nicht zugewiesen",
    "Bearbeiter (Anfrage)": name(effectiveAssignee(s)) || "nicht zugewiesen",
    Zuordnung: MATCH_STATUS_LABEL[s.match_status],
    Bestätigungsmail: CONFIRMATION_STATUS_LABEL[s.intake.confirmation_status],
    "Mail gesendet am": s.intake.confirmation_sent_at ? formatBerlinDateTime(s.intake.confirmation_sent_at) : "",
    "Mail-Fehler": s.intake.confirmation_error,
    "Anfrage-ID": s.id,
    "Eingangs-ID": s.intake_id,
  });
}

/** Eingang ohne Anfrage. Daten stammen aus dem gespeicherten Formular-Payload. */
export type UnresolvedIntakeInput = {
  id: string;
  status: string;
  received_at: string;
  payload: Record<string, unknown>;
  normalized_email: string;
  normalized_phone: string;
  confirmation_status: "pending" | "sent" | "failed";
  confirmation_sent_at: string | null;
  confirmation_error: string | null;
};

export function intakeToRow(i: UnresolvedIntakeInput): string[] {
  const p = (key: string) => {
    const value = i.payload[key];
    return typeof value === "string" || typeof value === "number" ? value : null;
  };
  const state = typeof i.payload.state === "string" ? i.payload.state : null;
  const source = p("addressSource");
  return toRow({
    "Eingang (deutsche Zeit)": formatBerlinDateTime(i.received_at),
    Verarbeitung: INTAKE_STATUS_LABEL[i.status] ?? i.status,
    "Name wie eingegeben": `${p("firstName") ?? ""} ${p("lastName") ?? ""}`.trim(),
    "E-Mail": i.normalized_email,
    Telefon: i.normalized_phone,
    Straße: p("street"),
    Hausnummer: p("houseNumber"),
    PLZ: p("postalCode"),
    Ort: p("city"),
    Gemeinde: p("municipality"),
    Kreis: p("county"),
    Bundesland: state,
    Einzugsgebiet: SERVICE_AREA_LABEL[serviceAreaStatus(state)],
    Breitengrad: p("latitude"),
    Längengrad: p("longitude"),
    Adressquelle: source === "photon" || source === "manual" ? ADDRESS_SOURCE_LABEL[source] : "",
    utm_source: p("utmSource"),
    utm_medium: p("utmMedium"),
    utm_campaign: p("utmCampaign"),
    utm_content: p("utmContent"),
    utm_term: p("utmTerm"),
    gclid: p("gclid"),
    fbclid: p("fbclid"),
    Landingpage: p("landingPage"),
    Referrer: p("referrer"),
    Bestätigungsmail: CONFIRMATION_STATUS_LABEL[i.confirmation_status],
    "Mail gesendet am": i.confirmation_sent_at ? formatBerlinDateTime(i.confirmation_sent_at) : "",
    "Mail-Fehler": i.confirmation_error,
    "Eingangs-ID": i.id,
  });
}
