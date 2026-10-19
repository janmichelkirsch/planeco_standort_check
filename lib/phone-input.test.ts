import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/lib/normalize";
import { applyPhoneEdit, buildPhoneCountryOptions, changePhoneCountry, flagEmoji } from "@/lib/phone-input";

/** Simuliert Tippen am Ende des Felds, Zeichen für Zeichen. */
function typeInto(text: string, country: "DE" | "AT" | "CH" = "DE") {
  let state = { value: "", country: country as string };
  for (const char of text) {
    const raw = state.value + char;
    const next = applyPhoneEdit(state.value, raw, raw.length, state.country as "DE");
    state = { value: next.value, country: next.country };
  }
  return state;
}

describe("buildPhoneCountryOptions", () => {
  const { pinned, others } = buildPhoneCountryOptions();

  it("zeigt Deutschland, Österreich, Schweiz oben", () => {
    expect(pinned.map((o) => `${o.flag} ${o.name} ${o.callingCode}`)).toEqual([
      "🇩🇪 Deutschland +49",
      "🇦🇹 Österreich +43",
      "🇨🇭 Schweiz +41",
    ]);
  });

  it("sortiert die übrigen alphabetisch mit deutschen Namen und ohne Doppelte", () => {
    const names = others.map((o) => o.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "de")));
    expect(others.some((o) => o.code === "DE")).toBe(false);
    expect(others.find((o) => o.code === "NL")?.name).toBe("Niederlande");
  });

  it("baut Flaggen aus dem Ländercode", () => {
    expect(flagEmoji("de")).toBe("🇩🇪");
  });
});

describe("applyPhoneEdit – Tippen", () => {
  it.each([
    ["01705551234", "0170 5551234"],
    ["040123456", "040 123456"],
    ["04519988776", "0451 9988776"],
  ])("formatiert %s beim Tippen zu %s", (typed, expected) => {
    expect(typeInto(typed).value).toBe(expected);
  });

  it("ignoriert Buchstaben und Sonderzeichen", () => {
    expect(typeInto("0170-555/12a34").value).toBe("0170 5551234");
  });

  it("formatiert nach dem gewählten Land", () => {
    expect(typeInto("0791234567", "CH").value).toBe("079 123 45 67");
  });

  it("begrenzt auf 17 Ziffern", () => {
    expect(typeInto("0".repeat(30)).value.replace(/\D/g, "")).toHaveLength(17);
  });

  it("ergibt eine Nummer, die der Server als gültig erkennt", () => {
    const { value, country } = typeInto("01705551234");
    expect(normalizePhone(value, country as "DE")).toBe("+491705551234");
  });
});

describe("applyPhoneEdit – Löschen und Cursor", () => {
  it("löscht beim Entfernen eines Leerzeichens die Ziffer davor", () => {
    // "0170 5551234", Backspace direkt hinter dem Leerzeichen (Cursor an Position 5)
    const edit = applyPhoneEdit("0170 5551234", "01705551234", 4, "DE");
    expect(edit.value.replace(/\D/g, "")).toBe("0175551234");
    expect(edit.value.slice(0, edit.caret).replace(/\D/g, "")).toBe("017");
  });

  it("hält den Cursor hinter derselben Ziffer, wenn in der Mitte getippt wird", () => {
    // "040 123456": nach "040 1" eine 9 einfügen
    const raw = "040 19" + "23456";
    const edit = applyPhoneEdit("040 123456", raw, 6, "DE");
    expect(edit.value.slice(0, edit.caret).replace(/\D/g, "")).toBe("04019");
  });

  it("leert das Feld komplett", () => {
    expect(applyPhoneEdit("0", "", 0, "DE")).toEqual({ value: "", country: "DE", caret: 0 });
  });
});

describe("applyPhoneEdit – Ländervorwahl im Feld", () => {
  it.each([
    ["+43 664 1234567", "AT", "0664 1234567"],
    ["0043 664 1234567", "AT", "0664 1234567"],
    ["+41791234567", "CH", "079 123 45 67"],
    ["+49 40 / 123 456", "DE", "040 123456"],
    ["004940123456", "DE", "040 123456"],
  ])("eingefügtes %s → Land %s, Feld %s", (pasted, country, value) => {
    const edit = applyPhoneEdit("", pasted, pasted.length, "DE");
    expect(edit).toMatchObject({ country, value });
  });

  it("stellt das Land schon beim Tippen der Vorwahl um", () => {
    const state = typeInto("+43", "DE");
    expect(state.country).toBe("AT");
  });

  it("wandelt beim Tippen in die nationale Schreibweise, sobald die Nummer gültig ist", () => {
    const state = typeInto("+436641234567", "DE");
    expect(state).toEqual({ value: "0664 1234567", country: "AT" });
  });

  it("lässt nicht eindeutige Vorwahlen (+1) international stehen und der Server erkennt sie trotzdem", () => {
    const edit = applyPhoneEdit("", "+1 212 555", 10, "DE");
    expect(edit.country).toBe("DE");
    expect(edit.value.startsWith("+1")).toBe(true);
    expect(normalizePhone("+1 212 555 0123", "DE")).toBe("+12125550123");
  });
});

describe("changePhoneCountry", () => {
  it("formatiert eine vorhandene Nummer nach dem neuen Land", () => {
    expect(changePhoneCountry("0791234567", "CH").value).toBe("079 123 45 67");
  });
});
