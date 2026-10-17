import { parsePhoneNumberFromString } from "libphonenumber-js";

/** E.164 (`+491705551234`) lesbar: `+49 170 5551234`. Unbekanntes bleibt, wie es ist. */
export function formatPhone(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}
