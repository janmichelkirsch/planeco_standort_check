import { describe, expect, it } from "vitest";
import { originOf, type TrackingFields } from "@/lib/channel";

const none: TrackingFields = { utm_source: null, utm_medium: null, utm_campaign: null, gclid: null, fbclid: null, referrer: null };
const t = (fields: Partial<TrackingFields>) => ({ ...none, ...fields });

describe("originOf", () => {
  it.each([
    ["google", "Google Ads"],
    ["Google", "Google Ads"],
    ["adwords", "Google Ads"],
    ["meta", "Meta"],
    ["facebook", "Meta"],
    ["instagram", "Meta"],
    ["ig", "Meta"],
    ["newsletter", "Newsletter"],
    ["linkedin", "linkedin"],
  ])("utm_source %s → %s", (source, channel) => {
    expect(originOf(t({ utm_source: source })).channel).toBe(channel);
  });

  it("E-Mail-Medium zählt als Newsletter", () => {
    expect(originOf(t({ utm_source: "brevo", utm_medium: "email" })).channel).toBe("Newsletter");
  });

  it("nur gclid (Google-Autotagging ohne UTM) → Google Ads, Kampagne unbekannt", () => {
    expect(originOf(t({ gclid: "Cj0" }))).toEqual({
      channel: "Google Ads",
      campaign: "Kampagne unbekannt",
      hasCampaignName: false,
      click: "Google-Klick",
      referrerHost: null,
      fromCampaign: true,
    });
  });

  it("nur fbclid → Meta", () => {
    expect(originOf(t({ fbclid: "fb.1", referrer: "https://l.facebook.com/" }))).toMatchObject({ channel: "Meta", click: "Meta-Klick" });
  });

  it("UTM schlägt Klick-ID, Kampagnenname aus utm_campaign", () => {
    expect(originOf(t({ utm_source: "meta", utm_campaign: "standortcheck_norden", gclid: "x" }))).toMatchObject({
      channel: "Meta",
      campaign: "standortcheck_norden",
      hasCampaignName: true,
      click: "Google-Klick",
    });
  });

  it("ohne Kampagne: Verweis mit Host oder direkt", () => {
    expect(originOf(t({ referrer: "https://www.google.com/search?q=x" }))).toMatchObject({
      channel: "Verweis",
      campaign: "Ohne Kampagne",
      referrerHost: "google.com",
      fromCampaign: false,
    });
    expect(originOf(none)).toMatchObject({ channel: "Direkt", campaign: "Ohne Kampagne", fromCampaign: false });
  });

  it("leere Werte zählen nicht", () => {
    expect(originOf(t({ utm_source: "  ", gclid: "" })).channel).toBe("Direkt");
  });
});
