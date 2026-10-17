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
