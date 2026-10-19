/**
 * Herkunft einer Anfrage für Anzeige und Auswertung (Case Pflicht 6): Kanal, Kampagne, Klick-ID.
 * Google Ads hängt bei automatischer Kennzeichnung oft nur `gclid` an (ohne UTM), Meta nur `fbclid` –
 * deshalb zählen die Klick-IDs als Kanal, wenn `utm_source` fehlt.
 */

export type TrackingFields = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer: string | null;
};

export type Origin = {
  channel: string;
  campaign: string;
  /** Kampagne aus `utm_campaign` (sonst „Kampagne unbekannt“ / „Ohne Kampagne“). */
  hasCampaignName: boolean;
  click: "Google-Klick" | "Meta-Klick" | null;
  referrerHost: string | null;
  /** Kanal stammt aus UTM-Parametern oder einer Klick-ID (also aus einer Kampagne). */
  fromCampaign: boolean;
};

export const NO_CAMPAIGN = "Ohne Kampagne";
export const UNKNOWN_CAMPAIGN = "Kampagne unbekannt";

const GOOGLE = new Set(["google", "adwords", "googleads", "google_ads"]);
const META = new Set(["meta", "facebook", "fb", "instagram", "ig"]);

const clean = (v: string | null) => v?.trim() || null;

function channelFromSource(source: string, medium: string | null): string {
  const s = source.toLowerCase();
  if (GOOGLE.has(s)) return "Google Ads";
  if (META.has(s)) return "Meta";
  if (s === "newsletter" || medium?.toLowerCase() === "email") return "Newsletter";
  return source;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function originOf(t: TrackingFields): Origin {
  const source = clean(t.utm_source);
  const name = clean(t.utm_campaign);
  const gclid = clean(t.gclid);
  const fbclid = clean(t.fbclid);
  const referrer = clean(t.referrer);
  const click = gclid ? "Google-Klick" : fbclid ? "Meta-Klick" : null;

  const channel = source
    ? channelFromSource(source, clean(t.utm_medium))
    : gclid
      ? "Google Ads"
      : fbclid
        ? "Meta"
        : referrer
          ? "Verweis"
          : "Direkt";
  const fromCampaign = !!(source || gclid || fbclid);

  return {
    channel,
    campaign: name ?? (fromCampaign ? UNKNOWN_CAMPAIGN : NO_CAMPAIGN),
    hasCampaignName: !!name,
    click,
    referrerHost: referrer ? hostOf(referrer) : null,
    fromCampaign,
  };
}
