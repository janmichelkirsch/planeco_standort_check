import { describe, expect, it } from "vitest";
import { normalizeEmail, normalizePhone } from "@/lib/normalize";

describe("normalizePhone", () => {
  // Telefonnummern der fünf Beispielanfragen aus dem Case
  it.each([
    ["+49 40 / 123 456", "+4940123456"],
    ["0170 5551234", "+491705551234"],
    ["040 55512345", "+494055512345"],
    ["004940123456", "+4940123456"],
    ["0451 9988776", "+494519988776"],
  ])("Case-Beispiel %s → %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it("erkennt Case-Beispiele 1 und 4 als dieselbe Nummer", () => {
    expect(normalizePhone("+49 40 / 123 456")).toBe(normalizePhone("004940123456"));
  });

  it("nimmt die nationale Nummer mit gewähltem Land (Dropdown + Ziffernfeld)", () => {
    expect(normalizePhone("040123456", "DE")).toBe("+4940123456");
    expect(normalizePhone("015123456789", "DE")).toBe("+4915123456789");
    expect(normalizePhone("0664 1234567", "AT")).toBe("+436641234567");
  });

  it("lässt eine eingetippte Ländervorwahl vor dem gewählten Land gewinnen", () => {
    expect(normalizePhone("+43 664 1234567", "DE")).toBe("+436641234567");
  });

  it("verträgt Klammern, Bindestriche und Leerzeichen am Rand", () => {
    expect(normalizePhone("  (040) 123-456  ")).toBe("+4940123456");
  });

  it.each(["", "12", "abc", "0000000", "+49 0", "0170"])("lehnt %j ab", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("normalizeEmail", () => {
  it("trimmt und schreibt klein", () => {
    expect(normalizeEmail("  Thomas.Ahrens@GMAIL.com ")).toBe("thomas.ahrens@gmail.com");
  });

  it("entfernt keine Punkte (kein Gmail-Sonderfall)", () => {
    expect(normalizeEmail("t.ahrens@gmail.com")).not.toBe(normalizeEmail("tahrens@gmail.com"));
  });
});
