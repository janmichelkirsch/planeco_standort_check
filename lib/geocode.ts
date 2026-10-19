import "server-only";
import { areaQuery, geocodeQuery, geocodeUpdate, pickGeocodeMatch } from "@/lib/geocode-match";
import { searchAddresses } from "@/lib/photon";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Schlägt manuell eingegebene Adressen bei Photon nach und ergänzt Gemeinde, Kreis, Bundesland, Koordinaten
 * (Spezifikation v3, §5.3). Läuft nach dem Anlegen der Anfrage; ein Ausfall von Photon blockiert nie etwas:
 * `failed` wird bei „Erneut verarbeiten“ wiederholt. Wirft nie.
 */

const TIMEOUT_MS = 5000;
const OPEN_STATES = ["pending", "failed"];

type Pending = { id: string; street: string; house_number: string; postal_code: string; city: string };

async function geocodeOne(row: Pending): Promise<void> {
  const supabase = getSupabaseAdmin();
  let update: Record<string, unknown>;
  try {
    const address = { street: row.street, houseNumber: row.house_number, postalCode: row.postal_code, city: row.city };
    let match = pickGeocodeMatch(await searchAddresses(geocodeQuery(address), AbortSignal.timeout(TIMEOUT_MS)), address);
    // Adresse unbekannt (z. B. PLZ passt nicht zur Straße): wenigstens den Ort über PLZ + Ort bestimmen.
    if (!match) {
      const area = pickGeocodeMatch(await searchAddresses(areaQuery(address), AbortSignal.timeout(TIMEOUT_MS)), address);
      match = area && { ...area, precision: "area" };
    }
    update = geocodeUpdate(match);
  } catch (error) {
    console.error(`[geocode] Photon für Anfrage ${row.id} nicht erreichbar:`, error instanceof Error ? error.message : error);
    update = { geocode_status: "failed" };
  }

  // Nur offene Fälle überschreiben: läuft das Nachschlagen doppelt, gewinnt das erste Ergebnis.
  const { error } = await supabase.from("submissions").update(update).eq("id", row.id).in("geocode_status", OPEN_STATES);
  if (error) console.error(`[geocode] Ergebnis für Anfrage ${row.id} nicht gespeichert`, error);
}

async function geocodeWhere(filter: { intakeId?: string }): Promise<void> {
  try {
    let query = getSupabaseAdmin()
      .from("submissions")
      .select("id, street, house_number, postal_code, city")
      .in("geocode_status", OPEN_STATES);
    if (filter.intakeId) query = query.eq("intake_id", filter.intakeId);
    const { data, error } = await query.limit(200);
    if (error) throw error;
    // Nacheinander, um Photon (kostenloser Dienst) nicht mit vielen parallelen Anfragen zu belasten.
    for (const row of data) await geocodeOne(row);
  } catch (error) {
    console.error("[geocode] Offene Adressen konnten nicht geladen werden", error);
  }
}

/** Nach dem Zuordnen eines Eingangs: dessen Anfrage nachschlagen, falls die Adresse manuell eingegeben wurde. */
export const geocodeForIntake = (intakeId: string) => geocodeWhere({ intakeId });

/** „Erneut verarbeiten“: alle noch offenen oder fehlgeschlagenen Adressen (höchstens 200 pro Klick). */
export const geocodePending = () => geocodeWhere({});
