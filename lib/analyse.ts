/**
 * Auswertung für die Analyse-Seite (Case Pflicht 6: „welche Kampagnen und Kanäle bringen Anfragen und welche taugen etwas“).
 * Gezählt wird pro Anfrage (Submission); Prüffälle und nicht verarbeitete Eingänge sind noch keine Anfragen.
 * Tage nach deutscher Zeit, damit eine Anfrage um 00:30 Uhr nicht beim Vortag landet.
 */
import { NO_CAMPAIGN, UNKNOWN_CAMPAIGN, originOf } from "@/lib/channel";
import { plotState, type ConfirmationStatus, type Outcome, type PlotState, type SubmissionRow } from "@/lib/dashboard";

export type AnalyseRow = {
  day: string;
  channel: string;
  campaign: string;
  outcome: Outcome | null;
  plot: PlotState;
  mail: ConfirmationStatus;
  fromCampaign: boolean;
};

const berlinDayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" });

/** Zeitstempel → Kalendertag in Berlin, `YYYY-MM-DD`. */
export function berlinDay(iso: string | Date): string {
  return berlinDayFormat.format(typeof iso === "string" ? new Date(iso) : iso);
}

export function toAnalyseRows(submissions: SubmissionRow[]): AnalyseRow[] {
  return submissions.map((s) => {
    const origin = originOf(s);
    return {
      day: berlinDay(s.created_at),
      channel: origin.channel,
      campaign: origin.campaign,
      outcome: s.outcome,
      plot: plotState(s),
      mail: s.intake.confirmation_status,
      fromCampaign: origin.fromCampaign,
    };
  });
}

/* ---------- Tage ---------- */

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Alle Tage von `from` bis `to` (einschließlich). Leer, wenn `from` nach `to` liegt. */
export function dayRange(from: string, to: string): string[] {
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
}

/* ---------- Filtern und Zählen ---------- */

export type AnalyseFilter = { from: string; to: string; channel: string; campaign: string };

export function filterRows(rows: AnalyseRow[], f: AnalyseFilter): AnalyseRow[] {
  return rows.filter(
    (r) => r.day >= f.from && r.day <= f.to && (!f.channel || r.channel === f.channel) && (!f.campaign || r.campaign === f.campaign),
  );
}

/** Gleich langer Zeitraum direkt davor, mit denselben Kanal-/Kampagnenfiltern. */
export function previousPeriod(rows: AnalyseRow[], f: AnalyseFilter): AnalyseRow[] {
  const length = dayRange(f.from, f.to).length;
  if (length === 0) return [];
  return filterRows(rows, { ...f, from: addDays(f.from, -length), to: addDays(f.from, -1) });
}

export type Tally = { total: number; rated: number; qualified: number; notQualified: number; unreachable: number; open: number };

export function tally(rows: Pick<AnalyseRow, "outcome">[]): Tally {
  const t: Tally = { total: 0, rated: 0, qualified: 0, notQualified: 0, unreachable: 0, open: 0 };
  for (const r of rows) {
    t.total += 1;
    if (r.outcome === "qualified") t.qualified += 1;
    else if (r.outcome === "not_qualified") t.notQualified += 1;
    else if (r.outcome === "unreachable") t.unreachable += 1;
    else t.open += 1;
  }
  t.rated = t.total - t.open;
  return t;
}

/** Unter so vielen bewerteten Anfragen ist eine Quote kaum aussagekräftig („wenig Daten“). */
export const LOW_DATA = 5;

/** Qualifiziert ÷ Anfragen mit Ergebnis; `null`, solange nichts bewertet ist. */
export function qualifiedRate(t: Tally): number | null {
  return t.rated === 0 ? null : t.qualified / t.rated;
}

export const formatRate = (rate: number | null) => (rate === null ? "–" : `${Math.round(rate * 100)} %`);

/* ---------- Vergleichstabelle ---------- */

export type CampaignLine = { campaign: string; tally: Tally };
export type ChannelLine = { channel: string; tally: Tally; campaigns: CampaignLine[] };

const byTotal = <T extends { tally: Tally }>(a: T, b: T, name: (x: T) => string) =>
  b.tally.total - a.tally.total || name(a).localeCompare(name(b), "de");

/** Kanal → Kampagnen, je mit Zählung; beides nach Anzahl Anfragen absteigend. */
export function compareTable(rows: AnalyseRow[]): ChannelLine[] {
  const byChannel = new Map<string, AnalyseRow[]>();
  for (const r of rows) byChannel.set(r.channel, [...(byChannel.get(r.channel) ?? []), r]);
  return [...byChannel.entries()]
    .map(([channel, list]) => {
      const byCampaign = new Map<string, AnalyseRow[]>();
      for (const r of list) byCampaign.set(r.campaign, [...(byCampaign.get(r.campaign) ?? []), r]);
      const campaigns = [...byCampaign.entries()]
        .map(([campaign, xs]) => ({ campaign, tally: tally(xs) }))
        .sort((a, b) => byTotal(a, b, (x) => x.campaign));
      return { channel, tally: tally(list), campaigns };
    })
    .sort((a, b) => byTotal(a, b, (x) => x.channel));
}

/* ---------- Kacheln ---------- */

export type Kpis = {
  total: number;
  /** Differenz zur Vorperiode; `null` ohne Vorperiode (Zeitraum „Gesamt“ ab der ersten Anfrage). */
  delta: number | null;
  qualified: number;
  rated: number;
  rate: number | null;
  /** Kanal mit den meisten Anfragen (Menge, nicht Qualität – die zeigt die Tabelle). */
  topChannel: { name: string; count: number; share: number } | null;
  /** Kampagnen mit Namen (`utm_campaign`); „Kampagne unbekannt“ zählt nicht mit. */
  campaigns: number;
  withoutCampaign: number;
};

export function kpis(rows: AnalyseRow[], previous: AnalyseRow[] | null): Kpis {
  const t = tally(rows);
  const table = compareTable(rows);
  const top = table[0];
  const named = new Set(
    rows.filter((r) => r.campaign !== NO_CAMPAIGN && r.campaign !== UNKNOWN_CAMPAIGN).map((r) => `${r.channel}|${r.campaign}`),
  );
  return {
    total: t.total,
    delta: previous === null ? null : t.total - previous.length,
    qualified: t.qualified,
    rated: t.rated,
    rate: qualifiedRate(t),
    topChannel: top ? { name: top.channel, count: top.tally.total, share: top.tally.total / t.total } : null,
    campaigns: named.size,
    withoutCampaign: rows.filter((r) => !r.fromCampaign).length,
  };
}

/** Kanäle und Kampagnen für die Filter, nach Häufigkeit. Kampagnen nur des gewählten Kanals. */
export function filterOptions(rows: AnalyseRow[], channel: string) {
  const count = (keys: string[]) => {
    const m = new Map<string, number>();
    for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "de")).map(([k]) => k);
  };
  return {
    channels: count(rows.map((r) => r.channel)),
    campaigns: count(rows.filter((r) => !channel || r.channel === channel).map((r) => r.campaign)),
  };
}
