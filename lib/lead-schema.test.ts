import { describe, expect, it } from "vitest";
import { leadSchema, toFieldErrors } from "@/lib/lead-schema";

const VALID = {
  street: "Hauptstraße",
  houseNumber: "14",
  postalCode: "01067",
  city: "Dresden",
  addressSource: "manual",
  state: null,
  latitude: null,
  longitude: null,
  firstName: "Thomas",
  lastName: "Ahrens",
  email: "thomas@example.com",
  phone: "+49 40 / 123 456",
};

const errorsOf = (input: unknown) => {
  const result = leadSchema.safeParse(input);
  return result.success ? {} : toFieldErrors(result.error.issues);
};

describe("leadSchema", () => {
  it("akzeptiert eine Anfrage im bisherigen Format (ohne neue Felder)", () => {
    const result = leadSchema.safeParse(VALID);
    expect(result.success).toBe(true);
    expect(result.data?.phoneCountry).toBe("DE");
  });

  it.each(["+49 40 / 123 456", "0170 5551234", "040 55512345", "004940123456", "0451 9988776"])(
    "akzeptiert die Case-Telefonnummer %s",
    (phone) => {
      expect(errorsOf({ ...VALID, phone })).toEqual({});
    },
  );

  it("meldet eine ungültige Nummer am Feld phone", () => {
    expect(errorsOf({ ...VALID, phone: "0170" })).toEqual({ phone: "Bitte prüfen Sie die Telefonnummer." });
  });

  it("meldet den Telefonfehler auch, wenn andere Felder fehlen (Prüfung pro Schritt)", () => {
    expect(errorsOf({ ...VALID, street: "", phone: "12" }).phone).toBe("Bitte prüfen Sie die Telefonnummer.");
  });

  it("zeigt bei leerem Telefon nur „bitte eingeben“", () => {
    expect(errorsOf({ ...VALID, phone: "" }).phone).toBe("Bitte geben Sie Ihre Telefonnummer ein.");
  });

  it("prüft die Nummer gegen das gewählte Land", () => {
    expect(errorsOf({ ...VALID, phoneCountry: "AT", phone: "0664 1234567" })).toEqual({});
    expect(errorsOf({ ...VALID, phoneCountry: "XX" }).phoneCountry).toBe("Bitte wählen Sie ein Land.");
  });

  it("übernimmt Tracking-Felder und Kreis/Gemeinde", () => {
    const data = leadSchema.parse({
      ...VALID,
      utmSource: " meta ",
      utmCampaign: "sommer",
      gclid: "abc",
      landingPage: "/standort-check?utm_source=meta",
      county: "Kreis Herzogtum Lauenburg",
      municipality: "Groß Grönau",
    });
    expect(data).toMatchObject({ utmSource: "meta", utmCampaign: "sommer", gclid: "abc", municipality: "Groß Grönau" });
  });

  it("lässt eine Anfrage nie an Tracking scheitern", () => {
    const data = leadSchema.parse({ ...VALID, referrer: "x".repeat(2000), utmTerm: 42, fbclid: "   " });
    expect(data.referrer).toHaveLength(500);
    expect(data.utmTerm).toBeNull();
    expect(data.fbclid).toBeNull();
  });

  it("verlangt eine UUID als clientRequestId, wenn sie mitkommt", () => {
    expect(leadSchema.safeParse({ ...VALID, clientRequestId: crypto.randomUUID() }).success).toBe(true);
    expect(leadSchema.safeParse({ ...VALID, clientRequestId: "123" }).success).toBe(false);
  });

  it("verwirft unbekannte Felder", () => {
    const data = leadSchema.parse({ ...VALID, isAdmin: true, status: "completed" });
    expect(data).not.toHaveProperty("isAdmin");
    expect(data).not.toHaveProperty("status");
  });
});
