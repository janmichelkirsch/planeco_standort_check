import type { TRACKING_FIELDS } from "@/lib/lead-schema";

/**
 * Kampagnen-Herkunft einer Anfrage: UTM-Parameter, Klick-IDs von Google/Meta, Landingpage und Referrer.
 * Wird beim ersten Laden erfasst und für die Sitzung gemerkt, damit ein Neuladen nichts verliert.
 */

export type Tracking = Partial<Record<(typeof TRACKING_FIELDS)[number], string>>;

const URL_PARAMS = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
  gclid: "gclid",
  fbclid: "fbclid",
} as const;

const STORAGE_KEY = "planeco.tracking";

/** Liest die Herkunft aus einer URL. Leere Parameter werden ignoriert. */
export function trackingFromLocation(href: string, referrer: string): { tracking: Tracking; hasCampaign: boolean } {
  const url = new URL(href);
  const tracking: Tracking = {};
  let hasCampaign = false;
  for (const [param, field] of Object.entries(URL_PARAMS)) {
    const value = url.searchParams.get(param)?.trim();
    if (value) {
      tracking[field] = value;
      hasCampaign = true;
    }
  }
  tracking.landingPage = url.pathname + url.search;
  if (referrer) tracking.referrer = referrer;
  return { tracking, hasCampaign };
}

/**
 * Herkunft für diese Sitzung:
 * - URL mit Kampagnen-Parametern → neuer Klick, gilt und wird gemerkt.
 * - Sonst die gemerkte Herkunft (z. B. nach Neuladen ohne Parameter).
 * - Sonst die aktuelle Seite (direkter Aufruf).
 */
export function resolveTracking(current: { tracking: Tracking; hasCampaign: boolean }, stored: Tracking | null): Tracking {
  if (current.hasCampaign || !stored) return current.tracking;
  return stored;
}

/** Nur im Browser. sessionStorage kann fehlen oder gesperrt sein (privater Modus) – dann ohne Merken. */
export function loadTracking(): Tracking {
  const current = trackingFromLocation(window.location.href, document.referrer);
  let stored: Tracking | null = null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    stored = raw ? (JSON.parse(raw) as Tracking) : null;
  } catch {
    stored = null;
  }
  const tracking = resolveTracking(current, stored);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tracking));
  } catch {
    // Merken ist nur Komfort; ohne Speicher gilt die aktuelle Seite.
  }
  return tracking;
}
