import { describe, expect, it } from "vitest";
import { checkName, checkOwnerId, checkSubmissionPatch, parseClaimForm, parseContactForm, parseSubmissionForm, returnUrl } from "@/lib/dashboard-forms";

const C = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const S = "11111111-2222-4333-8444-555555555555";
const EMILY = "99999999-8888-4777-8666-555555555555";
const form = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });

describe("returnUrl", () => {
  it("behält Ansicht und Sortierung, klappt den Kontakt auf", () => {
    expect(returnUrl(form({ view: "mine", sort: "name", dir: "asc" }), "saved", C)).toBe(
      `/admin?view=mine&sort=name&dir=asc&result=saved&open=${C}#kontakt-${C}`,
    );
  });

  it("baut nie eine fremde Adresse, auch bei manipulierten Feldern", () => {
    const url = returnUrl(form({ view: "https://evil.example", sort: "x" }), "error", "../../x");
    expect(url).toBe("/admin?view=open&sort=latest&dir=desc&result=error");
  });
});

describe("parseClaimForm", () => {
  it("braucht eine gültige Kontakt-ID", () => {
    expect(parseClaimForm(form({ contactId: C }))).toEqual({ contactId: C });
    expect(parseClaimForm(form({ contactId: "x" }))).toBeNull();
  });
});

describe("parseContactForm", () => {
  const base = { contactId: C, ownerId: "", ownerIdBefore: "", firstName: "Thomas", lastName: "Ahrens", firstNameBefore: "Thomas", lastNameBefore: "Ahrens" };

  it("meldet nur geänderte Felder", () => {
    expect(parseContactForm(form(base))).toEqual({ contactId: C });
    expect(parseContactForm(form({ ...base, ownerId: EMILY }))).toEqual({ contactId: C, owner: EMILY });
    expect(parseContactForm(form({ ...base, ownerId: "", ownerIdBefore: EMILY }))).toEqual({ contactId: C, owner: null });
    expect(parseContactForm(form({ ...base, firstName: " Tom " }))).toEqual({ contactId: C, name: { first: "Tom", last: "Ahrens" } });
  });

  it.each([
    ["leerer Name", { firstName: "" }],
    ["Owner keine UUID", { ownerId: "admin" }],
    ["Kontakt keine UUID", { contactId: "1" }],
  ])("lehnt ab: %s", (_, change) => {
    expect(parseContactForm(form({ ...base, ...change }))).toBeNull();
  });
});

describe("parseSubmissionForm", () => {
  const base = { submissionId: S, contactId: C, status: "open", statusBefore: "open", outcome: "", outcomeBefore: "", override: "", overrideBefore: "" };

  it("meldet nur geänderte Felder", () => {
    expect(parseSubmissionForm(form(base))).toEqual({ submissionId: S, contactId: C });
    expect(parseSubmissionForm(form({ ...base, status: "completed", outcome: "qualified", override: EMILY }))).toEqual({
      submissionId: S,
      contactId: C,
      status: "completed",
      outcome: "qualified",
      override: EMILY,
    });
  });

  it("kann Ergebnis und Override zurücksetzen", () => {
    expect(parseSubmissionForm(form({ ...base, outcomeBefore: "qualified", overrideBefore: EMILY }))).toEqual({
      submissionId: S,
      contactId: C,
      outcome: null,
      override: null,
    });
  });

  it.each([
    ["unbekannter Status", { status: "done" }],
    ["unbekanntes Ergebnis", { outcome: "super" }],
    ["Override keine UUID", { override: "Emily" }],
  ])("lehnt ab: %s", (_, change) => {
    expect(parseSubmissionForm(form({ ...base, ...change }))).toBeNull();
  });
});

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
