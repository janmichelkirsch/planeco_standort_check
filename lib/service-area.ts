/**
 * Einzugsgebiet (Spezifikation v3, §5.4). Entscheidung mit Michel: ganz Deutschland.
 * Einschränken = Liste kürzen. Wird nie gespeichert, sondern bei der Anzeige berechnet –
 * eine Änderung gilt damit sofort auch für alle alten Anfragen.
 * Namen wie Photon sie mit `lang=de` liefert.
 */
export const SERVICE_AREA_STATES: readonly string[] = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

export type ServiceAreaStatus = "inside" | "outside" | "unknown";

/** `unknown`, solange kein Bundesland bekannt ist (manuelle Adresse, noch nicht nachgeschlagen). */
export function serviceAreaStatus(state: string | null, states: readonly string[] = SERVICE_AREA_STATES): ServiceAreaStatus {
  if (!state) return "unknown";
  return states.includes(state) ? "inside" : "outside";
}

export const SERVICE_AREA_LABEL: Record<ServiceAreaStatus, string> = {
  inside: "im Einzugsgebiet",
  outside: "außerhalb",
  unknown: "Gebiet unbekannt",
};
