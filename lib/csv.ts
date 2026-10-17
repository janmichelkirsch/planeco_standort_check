import { ADDRESS_SOURCE_LABEL, CONFIRMATION_STATUS_LABEL, formatBerlinDateTime } from "@/lib/format";
import type { LeadRow } from "@/lib/leads";

// Byte Order Mark: Ohne ihn zeigt Excel Umlaute (Klöpper, Groß Grönau) falsch an.
const UTF8_BOM = "﻿";
// Deutsches Excel erwartet Semikolon als Trennzeichen.
const SEPARATOR = ";";

const COLUMNS: { header: string; value: (lead: LeadRow) => string }[] = [
  { header: "Eingang (deutsche Zeit)", value: (l) => formatBerlinDateTime(l.created_at) },
  { header: "Vorname", value: (l) => l.first_name },
  { header: "Nachname", value: (l) => l.last_name },
  { header: "E-Mail", value: (l) => l.email },
  { header: "Telefon", value: (l) => l.phone ?? "" },
  { header: "Straße", value: (l) => l.street },
  { header: "Hausnummer", value: (l) => l.house_number },
  { header: "PLZ", value: (l) => l.postal_code },
  { header: "Ort", value: (l) => l.city },
  { header: "Bundesland", value: (l) => l.state ?? "" },
  { header: "Breitengrad", value: (l) => (l.latitude === null ? "" : String(l.latitude)) },
  { header: "Längengrad", value: (l) => (l.longitude === null ? "" : String(l.longitude)) },
  { header: "Adressquelle", value: (l) => ADDRESS_SOURCE_LABEL[l.address_source] },
  { header: "Bestätigungsmail", value: (l) => CONFIRMATION_STATUS_LABEL[l.confirmation_status] },
  { header: "Mail gesendet am", value: (l) => (l.confirmation_sent_at ? formatBerlinDateTime(l.confirmation_sent_at) : "") },
  { header: "Mail-Fehler", value: (l) => l.confirmation_error ?? "" },
  { header: "ID", value: (l) => l.id },
];

/**
 * Bereitet einen Zellwert auf:
 * - Formel-Schutz: Werte, die mit = + - @ beginnen, würde Excel als Formel ausführen (CSV-Injection).
 *   Ein vorangestelltes ' verhindert das. Betrifft auch Telefonnummern wie "+49 …".
 * - Werte mit Trennzeichen, Anführungszeichen oder Zeilenumbruch werden in "…" gesetzt.
 */
function toCell(raw: string): string {
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[";\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

/** Baut eine Excel-taugliche CSV-Datei aus allen Anfragen. */
export function leadsToCsv(leads: LeadRow[]): string {
  const header = COLUMNS.map((c) => toCell(c.header)).join(SEPARATOR);
  const lines = leads.map((lead) => COLUMNS.map((c) => toCell(c.value(lead))).join(SEPARATOR));
  return UTF8_BOM + [header, ...lines].join("\r\n") + "\r\n";
}
