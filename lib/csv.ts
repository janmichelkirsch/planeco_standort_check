// Byte Order Mark: Ohne ihn zeigt Excel Umlaute (Klöpper, Groß Grönau) falsch an.
const UTF8_BOM = "﻿";
// Deutsches Excel erwartet Semikolon als Trennzeichen.
const SEPARATOR = ";";

/**
 * Bereitet einen Zellwert auf:
 * - Formel-Schutz: Werte, die mit = + - @ beginnen, würde Excel als Formel ausführen (CSV-Injection).
 *   Ein vorangestelltes ' verhindert das. Betrifft auch Telefonnummern wie "+49 …".
 * - Werte mit Trennzeichen, Anführungszeichen oder Zeilenumbruch werden in "…" gesetzt.
 */
export function toCell(raw: string): string {
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[";\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

/** Baut eine Excel-taugliche CSV-Datei (UTF-8 mit BOM, Semikolon, CRLF). */
export function toCsv(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const lines = [header, ...rows].map((row) => row.map(toCell).join(SEPARATOR));
  return UTF8_BOM + lines.join("\r\n") + "\r\n";
}
