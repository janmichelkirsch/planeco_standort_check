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
