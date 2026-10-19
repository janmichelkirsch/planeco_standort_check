import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/**
 * Vereinheitlicht Kontaktdaten für das Matching (Spezifikation v3, §5.2).
 * Wird von Formular (Prüfung) und Server (Speichern) gleich genutzt, damit beide dieselbe Nummer sehen.
 */

export const DEFAULT_PHONE_COUNTRY: CountryCode = "DE";

/**
 * Telefonnummer → E.164 (`+4940123456`), oder `null`, wenn sie nicht gültig ist.
 * `country` gilt nur für Eingaben ohne Ländervorwahl; `+…` und `00…` werden direkt erkannt.
 * Leerzeichen, Schrägstriche, Klammern und Bindestriche sind erlaubt.
 */
export function normalizePhone(input: string, country: CountryCode = DEFAULT_PHONE_COUNTRY): string | null {
  const parsed = parsePhoneNumberFromString(input.trim(), country);
  return parsed?.isValid() ? parsed.number : null;
}

/**
 * E-Mail für den Vergleich: getrimmt und kleingeschrieben.
 * Bewusst keine weiteren Tricks (z. B. Gmail-Punkte entfernen): lieber eine Prüfung zu viel als ein falscher Treffer.
 */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}
