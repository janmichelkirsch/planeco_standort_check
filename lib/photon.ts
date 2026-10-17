/**
 * Adresssuche über Photon (komoot, OpenStreetMap), kostenlos und ohne API-Key.
 * https://photon.komoot.io
 */

const PHOTON_URL = "https://photon.komoot.io/api/";
// Grobe Bounding Box Deutschland (minLon, minLat, maxLon, maxLat)
const GERMANY_BBOX = "5.87,47.27,15.04,55.06";
const RESULT_LIMIT = 5;

export type AddressSuggestion = {
  id: string;
  label: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  /** Ortsteil, falls von der Stadt verschieden – hilft bei mehrfach vorkommenden Straßen. */
  district: string | null;
  state: string | null;
  /** Landkreis bzw. kreisfreie Stadt. */
  county: string | null;
  /** Gemeinde laut Photon (unabhängig vom bearbeitbaren Feld „Ort“). */
  municipality: string | null;
  latitude: number;
  longitude: number;
};

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_type?: string;
    osm_id?: number;
    type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    county?: string;
    state?: string;
    countrycode?: string;
  };
};

/** Wandelt ein Photon-Feature in unsere Adressfelder um. Nur Häuser und Straßen in DE sind brauchbar. */
export function toSuggestion(feature: PhotonFeature): AddressSuggestion | null {
  const p = feature.properties;
  if (p.countrycode !== "DE") return null;
  if (p.type !== "house" && p.type !== "street") return null;

  const street = p.street ?? (p.type === "street" ? p.name : undefined);
  if (!street) return null;

  const houseNumber = p.housenumber ?? "";
  const postalCode = p.postcode ?? "";
  const city = p.city ?? "";
  const [longitude, latitude] = feature.geometry.coordinates;

  // Ortsteil mit anzeigen: Es gibt z. B. mehrere "Hauptstraße 14" innerhalb Dresdens.
  const place = [postalCode, city].filter(Boolean).join(" ");
  const district = p.district && p.district !== city ? p.district : null;
  const label = `${[street, houseNumber].filter(Boolean).join(" ")}, ${place}${district ? ` (${district})` : ""}`;

  return {
    id: `${p.osm_type ?? ""}${p.osm_id ?? label}`,
    label,
    street,
    houseNumber,
    postalCode,
    city,
    district,
    state: p.state ?? null,
    county: p.county ?? null,
    municipality: p.city ?? null,
    latitude,
    longitude,
  };
}

export async function searchAddresses(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    lang: "de",
    limit: String(RESULT_LIMIT),
    bbox: GERMANY_BBOX,
  });

  const response = await fetch(`${PHOTON_URL}?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`Photon antwortet mit Status ${response.status}`);
  }

  const data: { features?: PhotonFeature[] } = await response.json();
  return (data.features ?? [])
    .map(toSuggestion)
    .filter((s): s is AddressSuggestion => s !== null);
}
