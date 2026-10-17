import { describe, expect, it } from "vitest";
import { toIntakeRow } from "@/lib/intake-row";
import { leadSchema } from "@/lib/lead-schema";

const lead = leadSchema.parse({
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
  email: "  Thomas.Ahrens@Example.com ",
  phoneCountry: "DE",
  phone: "040 123456",
  clientRequestId: "4f1c2b8e-2d3a-4e5f-9a7b-1c2d3e4f5a6b",
  utmSource: "meta",
});

describe("toIntakeRow", () => {
  it("normalisiert Mail und Telefon und übernimmt die Request-ID", () => {
    const row = toIntakeRow(lead, () => "unused");
    expect(row).toMatchObject({
      client_request_id: "4f1c2b8e-2d3a-4e5f-9a7b-1c2d3e4f5a6b",
      normalized_email: "thomas.ahrens@example.com",
      normalized_phone: "+4940123456",
    });
  });

  it("legt die Formulardaten wie eingegeben in den Payload, ohne die Request-ID", () => {
    const row = toIntakeRow(lead, () => "unused");
    expect(row?.payload).toMatchObject({ firstName: "Thomas", phone: "040 123456", phoneCountry: "DE", utmSource: "meta" });
    expect(row?.payload).not.toHaveProperty("clientRequestId");
  });

  it("nutzt eine eigene ID, wenn keine mitkommt", () => {
    const row = toIntakeRow({ ...lead, clientRequestId: undefined }, () => "fallback-id");
    expect(row?.client_request_id).toBe("fallback-id");
  });

  it("lehnt eine ungültige Nummer ab", () => {
    expect(toIntakeRow({ ...lead, phone: "0170" }, () => "x")).toBeNull();
  });
});
