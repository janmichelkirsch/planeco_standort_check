import { describe, expect, it } from "vitest";
import { toSuggestion } from "@/lib/photon";

const feature = (properties: Record<string, unknown>) => ({
  geometry: { coordinates: [10.71, 53.82] as [number, number] },
  properties: { countrycode: "DE", type: "house", ...properties },
});

describe("toSuggestion", () => {
  it("übernimmt Adresse, Bundesland, Kreis und Gemeinde", () => {
    const s = toSuggestion(
      feature({
        street: "Am Mühlenteich",
        housenumber: "7",
        postcode: "23627",
        city: "Groß Grönau",
        county: "Kreis Herzogtum Lauenburg",
        state: "Schleswig-Holstein",
      }),
    );
    expect(s).toMatchObject({
      street: "Am Mühlenteich",
      houseNumber: "7",
      postalCode: "23627",
      city: "Groß Grönau",
      municipality: "Groß Grönau",
      county: "Kreis Herzogtum Lauenburg",
      state: "Schleswig-Holstein",
      latitude: 53.82,
      longitude: 10.71,
    });
  });

  it("zeigt den Ortsteil im Label, wenn er von der Stadt abweicht", () => {
    const s = toSuggestion(feature({ street: "Hauptstraße", housenumber: "14", postcode: "01067", city: "Dresden", district: "Innere Altstadt" }));
    expect(s?.label).toBe("Hauptstraße 14, 01067 Dresden (Innere Altstadt)");
  });

  it.each([
    ["Hamburg", "Hamburg"],
    ["Berlin", "Berlin"],
    ["Bremerhaven", "Bremen"],
  ])("ergänzt das fehlende Bundesland beim Stadtstaat %s", (city, state) => {
    const s = toSuggestion(feature({ street: "Osterstraße", housenumber: "88", postcode: "20259", city }));
    expect(s?.state).toBe(state);
  });

  it("setzt fehlende Angaben auf null", () => {
    const s = toSuggestion(feature({ street: "Lindenweg", housenumber: "3", city: "Neustadt" }));
    expect(s).toMatchObject({ county: null, state: null, district: null });
  });

  it.each([
    ["Ausland", { countrycode: "AT", street: "Ring", city: "Wien" }],
    ["kein Haus/keine Straße", { type: "city", name: "Hamburg" }],
    ["ohne Straße", { type: "house", city: "Hamburg" }],
  ])("verwirft Treffer: %s", (_, props) => {
    expect(toSuggestion(feature(props))).toBeNull();
  });
});
