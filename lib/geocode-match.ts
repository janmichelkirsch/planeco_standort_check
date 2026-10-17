import type { AddressSuggestion } from "@/lib/photon";

/**
 * Wählt für eine manuell eingegebene Adresse den passenden Photon-Treffer (Spezifikation v3, §5.3).
 * Nur Treffer mit derselben PLZ zählen – sonst landet z. B. „Am Mühlenteich 7, Groß Grönau“ in Gronau (Leine).
 *
 * - `address`: dieselbe Straße gefunden (bevorzugt dieselbe Hausnummer) → Koordinaten übernehmen.
 * - `area`: nur eine andere Straße derselben PLZ → Gemeinde/Kreis/Bundesland stimmen, Koordinaten nicht.
 *   Beispiel aus dem Case: „Hauptstraße 14, 01067 Dresden“ findet nur „Schützenplatz 14, 01067“.
 */
export type GeocodeMatch = { suggestion: AddressSuggestion; precision: "address" | "area" };

const normalize = (v: string) => v.toLowerCase().replace(/\s+/g, "").replace(/str\.$/, "straße");

export function pickGeocodeMatch(
  suggestions: AddressSuggestion[],
  address: { street: string; houseNumber: string; postalCode: string },
): GeocodeMatch | null {
  const samePostal = suggestions.filter((s) => s.postalCode === address.postalCode.trim());
  const sameStreet = samePostal.filter((s) => normalize(s.street) === normalize(address.street));

  if (sameStreet.length > 0) {
    const suggestion =
      sameStreet.find((s) => s.houseNumber && normalize(s.houseNumber) === normalize(address.houseNumber)) ?? sameStreet[0];
    return { suggestion, precision: "address" };
  }
  return samePostal[0] ? { suggestion: samePostal[0], precision: "area" } : null;
}

/** Suchtext für Photon: erst die ganze Adresse, als Rückfall nur PLZ und Ort. */
export const geocodeQuery = (a: { street: string; houseNumber: string; postalCode: string; city: string }) =>
  `${a.street} ${a.houseNumber}, ${a.postalCode} ${a.city}`;

export const areaQuery = (a: { postalCode: string; city: string }) => `${a.postalCode} ${a.city}`;

/** Felder für `submissions`. Bei `area` keine Koordinaten, damit „Karte“ nicht auf ein falsches Haus zeigt. */
export function geocodeUpdate(match: GeocodeMatch | null) {
  if (!match) return { geocode_status: "not_found" };
  const { suggestion: s, precision } = match;
  return {
    geocode_status: "geocoded",
    municipality: s.municipality,
    county: s.county,
    state: s.state,
    latitude: precision === "address" ? s.latitude : null,
    longitude: precision === "address" ? s.longitude : null,
  };
}
