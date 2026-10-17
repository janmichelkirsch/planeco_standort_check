import { describe, expect, it } from "vitest";
import { parseResolveForm, resultForErrorCode, summarizeHistory, toReviewCase } from "@/lib/review";

const INTAKE = "11111111-2222-4333-8444-555555555555";
const CONTACT = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const form = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });

describe("parseResolveForm", () => {
  it("Zuordnen ohne Namensänderung (Standard „behalten“)", () => {
    expect(parseResolveForm(form({ intakeId: INTAKE, action: "attach_existing", contactId: CONTACT, name: "keep" }))).toEqual({
      intakeId: INTAKE,
      action: "attach_existing",
      contactId: CONTACT,
      firstName: null,
      lastName: null,
    });
  });

  it("Zuordnen mit „Name übernehmen“", () => {
    const parsed = parseResolveForm(
      form({ intakeId: INTAKE, action: "attach_existing", contactId: CONTACT, name: "take", firstName: " Anna ", lastName: "Kirsch" }),
    );
    expect(parsed).toMatchObject({ firstName: "Anna", lastName: "Kirsch" });
  });

  it("Neuen Kontakt anlegen braucht keine Kontakt-ID", () => {
    expect(parseResolveForm(form({ intakeId: INTAKE, action: "create_new" }))).toEqual({ intakeId: INTAKE, action: "create_new" });
  });

  it.each([
    ["ohne Eingangs-ID", { action: "create_new" }],
    ["unbekannte Aktion", { intakeId: INTAKE, action: "delete" }],
    ["Zuordnen ohne Kontakt", { intakeId: INTAKE, action: "attach_existing" }],
    ["keine UUID", { intakeId: "1; drop table", action: "create_new" }],
    ["Name übernehmen ohne Namen", { intakeId: INTAKE, action: "attach_existing", contactId: CONTACT, name: "take" }],
  ])("lehnt ab: %s", (_, values) => {
    expect(parseResolveForm(form(values))).toBeNull();
  });
});

describe("summarizeHistory", () => {
  it("zählt Anfragen je Kontakt und nimmt die neueste Adresse", () => {
    const history = summarizeHistory([
      { contact_id: "c1", created_at: "2026-10-01T08:00:00Z", street: "Alt", house_number: "1", postal_code: "11111", city: "A" },
      { contact_id: "c1", created_at: "2026-10-05T08:00:00Z", street: "Neu", house_number: "2", postal_code: "22222", city: "B" },
      { contact_id: "c2", created_at: "2026-10-03T08:00:00Z", street: "X", house_number: "3", postal_code: "33333", city: "C" },
    ]);
    expect(history.get("c1")).toEqual({ count: 2, latestAt: "2026-10-05T08:00:00Z", latestAddress: "Neu 2, 22222 B" });
    expect(history.get("c2")?.count).toBe(1);
  });
});

describe("toReviewCase", () => {
  it("liest die Eingabe aus dem Payload und hängt den Verlauf an die Kandidaten", () => {
    const review = toReviewCase(
      {
        id: INTAKE,
        received_at: "2026-10-17T20:26:13Z",
        payload: { firstName: "Anna", lastName: "Kirsch", street: "Weidengrund", houseNumber: "48", postalCode: "33154", city: "Salzkotten", utmSource: "test", utmCampaign: "branchtest" },
        normalized_email: "anna@example.com",
        normalized_phone: "+491798290490",
      },
      [
        {
          contact_id: "c1",
          first_name: "Michel",
          last_name: "Kirsch",
          account_owner_id: null,
          owner_name: null,
          email_match: false,
          phone_match: true,
          name_match: false,
        },
      ],
      summarizeHistory([{ contact_id: "c1", created_at: "2026-10-17T20:25:00Z", street: "Weidengrund", house_number: "48", postal_code: "33154", city: "Salzkotten" }]),
    );
    expect(review).toMatchObject({ firstName: "Anna", address: "Weidengrund 48, 33154 Salzkotten", campaign: "test / branchtest" });
    expect(review.candidates[0].history?.count).toBe(1);
  });
});

describe("resultForErrorCode", () => {
  it("ordnet die Fehlercodes aus SQL zu", () => {
    expect(["P0409", "P0401", "P0404", "P0422", undefined].map(resultForErrorCode)).toEqual(["conflict", "forbidden", "invalid", "invalid", "error"]);
  });
});
