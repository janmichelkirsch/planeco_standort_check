import { describe, expect, it } from "vitest";
import { checkName, checkOwnerId, checkSubmissionPatch } from "@/lib/dashboard-forms";

const EMILY = "99999999-8888-4777-8666-555555555555";

describe("checkOwnerId", () => {
  it("null gibt frei, eine UUID setzt, alles andere ist ungültig", () => {
    expect(checkOwnerId(null)).toBeNull();
    expect(checkOwnerId(EMILY)).toBe(EMILY);
    expect(checkOwnerId("")).toBeUndefined();
    expect(checkOwnerId("emily")).toBeUndefined();
    expect(checkOwnerId(undefined)).toBeUndefined();
  });
});

describe("checkName", () => {
  it("trimmt und verlangt beide Teile mit höchstens 200 Zeichen", () => {
    expect(checkName(" Tom ", "Ahrens")).toEqual({ first: "Tom", last: "Ahrens" });
    expect(checkName("Tom", "  ")).toBeNull();
    expect(checkName("x".repeat(201), "Ahrens")).toBeNull();
    expect(checkName(1, "Ahrens")).toBeNull();
  });
});

describe("checkSubmissionPatch", () => {
  it("übernimmt nur übergebene, gültige Felder", () => {
    expect(checkSubmissionPatch({ status: "completed" })).toEqual({ status: "completed" });
    expect(checkSubmissionPatch({ outcome: null })).toEqual({ outcome: null });
    expect(checkSubmissionPatch({ outcome: "qualified", override: EMILY })).toEqual({ outcome: "qualified", override: EMILY });
    expect(checkSubmissionPatch({ override: null })).toEqual({ override: null });
  });

  it.each([
    ["leer", {}],
    ["kein Objekt", "status"],
    ["unbekannter Status", { status: "done" }],
    ["unbekanntes Ergebnis", { outcome: "great" }],
    ["Bearbeiter keine UUID", { override: "emily" }],
    ["leerer Bearbeiter", { override: "" }],
  ])("lehnt ab: %s", (_, input) => {
    expect(checkSubmissionPatch(input)).toBeNull();
  });
});
