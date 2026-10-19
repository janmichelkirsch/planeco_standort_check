import { describe, expect, it } from "vitest";
import { geocodeUpdate, pickGeocodeMatch } from "@/lib/geocode-match";
import type { AddressSuggestion } from "@/lib/photon";

const hit = (street: string, houseNumber: string, postalCode: string, city: string): AddressSuggestion => ({
  id: `${street}${houseNumber}${postalCode}`,
  label: "",
  street,
  houseNumber,
  postalCode,
  city,
  district: null,
  state: "Bundesland",
  county: "Kreis",
  municipality: city,
  latitude: 1,
  longitude: 2,
});

const ADDRESS = { street: "Am Mühlenteich", houseNumber: "7", postalCode: "23627" };

describe("pickGeocodeMatch", () => {
  it("nimmt dieselbe Straße und Hausnummer (genau)", () => {
    const match = pickGeocodeMatch([hit("Am Mühlenteich", "5", "23627", "Groß Grönau"), hit("Am Mühlenteich", "7", "23627", "Groß Grönau")], ADDRESS);
    expect(match).toMatchObject({ precision: "address", suggestion: { houseNumber: "7" } });
  });

  it("nimmt dieselbe Straße auch ohne passende Hausnummer (genau genug)", () => {
    expect(pickGeocodeMatch([hit("Am Mühlenteich", "", "23627", "Groß Grönau")], ADDRESS)?.precision).toBe("address");
  });

  it("verwirft Treffer mit anderer PLZ (Case: Gronau (Leine) statt Groß Grönau)", () => {
    expect(pickGeocodeMatch([hit("Am Mühlenteich", "7", "31028", "Gronau (Leine)")], ADDRESS)).toBeNull();
  });

  it("andere Straße derselben PLZ zählt nur für den Ort (Case: Schützenplatz statt Hauptstraße, 01067 Dresden)", () => {
    const match = pickGeocodeMatch([hit("Schützenplatz", "14", "01067", "Dresden")], { street: "Hauptstraße", houseNumber: "14", postalCode: "01067" });
    expect(match).toMatchObject({ precision: "area", suggestion: { city: "Dresden" } });
  });

  it("erkennt „Hauptstr.“ als „Hauptstraße“ und Hausnummern mit Leerzeichen", () => {
    const match = pickGeocodeMatch([hit("Hauptstraße", "14 a", "01067", "Dresden")], { street: "Hauptstr.", houseNumber: "14a", postalCode: "01067" });
    expect(match).toMatchObject({ precision: "address", suggestion: { houseNumber: "14 a" } });
  });

  it("gibt null zurück, wenn nichts passt", () => {
    expect(pickGeocodeMatch([], ADDRESS)).toBeNull();
  });
});

describe("geocodeUpdate", () => {
  it("übernimmt bei genauer Adresse auch Koordinaten", () => {
    expect(geocodeUpdate({ suggestion: hit("Am Mühlenteich", "7", "23627", "Groß Grönau"), precision: "address" })).toMatchObject({
      geocode_status: "geocoded",
      municipality: "Groß Grönau",
      state: "Bundesland",
      latitude: 1,
    });
  });

  it("übernimmt beim Ort keine Koordinaten", () => {
    expect(geocodeUpdate({ suggestion: hit("Schützenplatz", "14", "01067", "Dresden"), precision: "area" })).toMatchObject({
      geocode_status: "geocoded",
      latitude: null,
      longitude: null,
    });
  });

  it("markiert nicht Gefundenes", () => {
    expect(geocodeUpdate(null)).toEqual({ geocode_status: "not_found" });
  });
});
