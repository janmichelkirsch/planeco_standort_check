const berlinDateTime = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  dateStyle: "short",
  timeStyle: "short",
});

/** Zeitstempel aus der Datenbank (UTC) in deutscher Zeit, z. B. "17.10.26, 16:47". */
export function formatBerlinDateTime(isoTimestamp: string): string {
  return berlinDateTime.format(new Date(isoTimestamp));
}

export const CONFIRMATION_STATUS_LABEL = { pending: "ausstehend", sent: "gesendet", failed: "fehlgeschlagen" } as const;

export const ADDRESS_SOURCE_LABEL = { photon: "Vorschlag", manual: "Manuell" } as const;

export const SUBMISSION_STATUS_LABEL = { open: "offen", contacted: "kontaktiert", completed: "abgeschlossen" } as const;

export const OUTCOME_LABEL = { qualified: "qualifiziert", not_qualified: "nicht qualifiziert", unreachable: "nicht erreicht" } as const;

/** Großgeschrieben für Badges und Auswahlfelder im Dashboard. */
export const SUBMISSION_STATUS_TITLE = { open: "Offen", contacted: "Kontaktiert", completed: "Abgeschlossen" } as const;

export const OUTCOME_TITLE = { qualified: "Qualifiziert", not_qualified: "Nicht qualifiziert", unreachable: "Nicht erreicht" } as const;

export const MATCH_STATUS_LABEL = {
  auto_matched: "automatisch zugeordnet",
  manually_matched: "manuell zugeordnet",
  new_contact_created: "neuer Kontakt",
} as const;

export const INTAKE_STATUS_LABEL: Record<string, string> = {
  received: "nicht verarbeitet",
  failed: "nicht verarbeitet",
  needs_review: "in Prüfung",
  processed: "zugeordnet",
};

/** Hinweis, solange Gemeinde/Bundesland fehlen. */
export const GEOCODE_STATUS_LABEL: Record<string, string> = {
  pending: "Adresse wird nachgeschlagen …",
  not_found: "Adresse nicht gefunden – Gemeinde/Bundesland unbekannt",
  failed: "Nachschlagen fehlgeschlagen – wird erneut versucht",
};

const berlinLongDate = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Datum in deutscher Zeit ausgeschrieben, z. B. "Montag, 19. Oktober 2026". */
export function formatBerlinLongDate(date: Date): string {
  return berlinLongDate.format(date);
}

const berlinHour = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "numeric", hourCycle: "h23" });

/** Gruß nach deutscher Uhrzeit: bis 11 Uhr „Guten Morgen“, bis 18 Uhr „Guten Tag“, danach „Guten Abend“. */
export function greetingFor(date: Date): string {
  // format() liefert "07 Uhr", daher nur den Stunden-Teil lesen.
  const hour = Number(berlinHour.formatToParts(date).find((p) => p.type === "hour")?.value);
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}
