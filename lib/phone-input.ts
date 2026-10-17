import { AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/**
 * Logik des Telefonfelds (Vorwahl-Dropdown + Nummernfeld), ohne React – damit testbar.
 * Das Feld enthält die nationale Schreibweise („0170 5551234“), die Vorwahl steht im Dropdown.
 */

export type PhoneCountryOption = { code: CountryCode; name: string; callingCode: string; flag: string };

const PINNED_COUNTRIES: CountryCode[] = ["DE", "AT", "CH"];
// Längste Rufnummer laut ITU: 15 Ziffern plus nationale Vorwahl-Null; mehr ist sicher ein Tippfehler.
const MAX_DIGITS = 17;

/** Flaggen-Emoji aus dem Ländercode (Regional Indicator Symbols). */
export function flagEmoji(code: string): string {
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Dropdown-Einträge: Deutschland, Österreich, Schweiz oben, danach alle anderen alphabetisch (deutsche Namen). */
export function buildPhoneCountryOptions(): { pinned: PhoneCountryOption[]; others: PhoneCountryOption[] } {
  const names = new Intl.DisplayNames(["de"], { type: "region" });
  const toOption = (code: CountryCode): PhoneCountryOption => ({
    code,
    name: names.of(code) ?? code,
    callingCode: `+${getCountryCallingCode(code)}`,
    flag: flagEmoji(code),
  });
  const others = getCountries()
    .filter((code) => !PINNED_COUNTRIES.includes(code))
    .map(toOption)
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
  return { pinned: PINNED_COUNTRIES.map(toOption), others };
}

const digitsOf = (value: string) => value.replace(/\D/g, "");

/** Beginnt mit Ländervorwahl (`+49 …` oder `0049 …`). */
export const isInternational = (value: string) => /^\s*(\+|00)/.test(value);

/** Position direkt hinter der n-ten Ziffer (für den Cursor nach dem Formatieren). */
function positionAfterDigits(value: string, n: number): number {
  if (n <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (/\d/.test(value[i]) && ++seen === n) return i + 1;
  }
  return value.length;
}

export type PhoneEdit = { value: string; country: CountryCode; caret: number };

/**
 * Verarbeitet eine Eingabe im Nummernfeld.
 * - Nationale Eingabe: nur Ziffern zählen, Formatierung nach Land („01705551234“ → „0170 5551234“).
 * - Eingabe mit `+…` oder `00…` (z. B. eingefügt): Land wird erkannt und im Dropdown gesetzt.
 *   Sobald die Nummer gültig ist, steht sie national im Feld („+43 664 1234567“ → AT, „0664 1234567“).
 * - Löschen eines Leerzeichens löscht die Ziffer davor (sonst würde die Formatierung es sofort wieder einfügen).
 * - Der Cursor bleibt hinter derselben Ziffer, auch wenn sich Leerzeichen verschieben.
 */
export function applyPhoneEdit(prev: string, raw: string, caret: number | null, country: CountryCode): PhoneEdit {
  if (isInternational(raw)) {
    const international = `+${digitsOf(raw.trim().replace(/^00/, "")).slice(0, MAX_DIGITS)}`;
    const parsed = parsePhoneNumberFromString(international);
    if (parsed?.country && parsed.isValid()) {
      const value = parsed.formatNational();
      return { value, country: parsed.country, caret: value.length };
    }
    const typing = new AsYouType();
    const value = typing.input(international);
    return { value, country: typing.getCountry() ?? country, caret: value.length };
  }

  const end = caret ?? raw.length;
  let digits = digitsOf(raw);
  let digitsBeforeCaret = digitsOf(raw.slice(0, end)).length;

  const removedOnlyFormatting = digits === digitsOf(prev) && raw.length < prev.length;
  if (removedOnlyFormatting && digitsBeforeCaret > 0) {
    digits = digits.slice(0, digitsBeforeCaret - 1) + digits.slice(digitsBeforeCaret);
    digitsBeforeCaret -= 1;
  }

  digits = digits.slice(0, MAX_DIGITS);
  const value = digits ? new AsYouType(country).input(digits) : "";
  return { value, country, caret: positionAfterDigits(value, Math.min(digitsBeforeCaret, digits.length)) };
}

/** Neues Land im Dropdown: vorhandene nationale Nummer nach den Regeln des neuen Landes formatieren. */
export function changePhoneCountry(value: string, country: CountryCode): PhoneEdit {
  return applyPhoneEdit(value, value, null, country);
}
