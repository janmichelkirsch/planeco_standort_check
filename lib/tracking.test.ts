import { describe, expect, it } from "vitest";
import { resolveTracking, trackingFromLocation } from "@/lib/tracking";

describe("trackingFromLocation", () => {
  it("liest UTM-Parameter, Klick-IDs, Landingpage und Referrer", () => {
    const { tracking, hasCampaign } = trackingFromLocation(
      "https://example.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=sommer&fbclid=abc",
      "https://l.facebook.com/",
    );
    expect(hasCampaign).toBe(true);
    expect(tracking).toEqual({
      utmSource: "meta",
      utmMedium: "paid_social",
      utmCampaign: "sommer",
      fbclid: "abc",
      landingPage: "/?utm_source=meta&utm_medium=paid_social&utm_campaign=sommer&fbclid=abc",
      referrer: "https://l.facebook.com/",
    });
  });

  it("erkennt Google-Klicks auch ohne UTM", () => {
    const { tracking, hasCampaign } = trackingFromLocation("https://example.com/?gclid=xyz", "");
    expect(hasCampaign).toBe(true);
    expect(tracking).toEqual({ gclid: "xyz", landingPage: "/?gclid=xyz" });
  });

  it("ignoriert leere Parameter", () => {
    const { tracking, hasCampaign } = trackingFromLocation("https://example.com/?utm_source=&utm_medium=%20", "");
    expect(hasCampaign).toBe(false);
    expect(tracking.utmSource).toBeUndefined();
  });
});

describe("resolveTracking", () => {
  const stored = { utmSource: "google", landingPage: "/?utm_source=google" };

  it("behält die gemerkte Kampagne nach Neuladen ohne Parameter", () => {
    const current = trackingFromLocation("https://example.com/", "");
    expect(resolveTracking(current, stored)).toBe(stored);
  });

  it("nimmt einen neuen Kampagnen-Klick statt der gemerkten", () => {
    const current = trackingFromLocation("https://example.com/?utm_source=meta", "");
    expect(resolveTracking(current, stored).utmSource).toBe("meta");
  });

  it("nimmt die aktuelle Seite, wenn nichts gemerkt ist", () => {
    const current = trackingFromLocation("https://example.com/", "https://www.google.com/");
    expect(resolveTracking(current, null)).toEqual({ landingPage: "/", referrer: "https://www.google.com/" });
  });
});
