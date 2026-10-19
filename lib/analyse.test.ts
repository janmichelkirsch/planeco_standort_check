import { describe, expect, it } from "vitest";
import {
  addDays,
  berlinDay,
  compareTable,
  dayRange,
  filterOptions,
  filterRows,
  formatRate,
  kpis,
  previousPeriod,
  qualifiedRate,
  tally,
  type AnalyseRow,
} from "@/lib/analyse";

const row = (r: Partial<AnalyseRow>): AnalyseRow => ({
  day: "2026-10-15",
  channel: "Google Ads",
  campaign: "hamburg",
  outcome: null,
  plot: "exact",
  mail: "sent",
  fromCampaign: true,
  ...r,
});

describe("berlinDay", () => {
  it("zählt nach deutscher Zeit (Sommerzeit, UTC+2)", () => {
    expect(berlinDay("2026-10-18T22:30:00Z")).toBe("2026-10-19");
    expect(berlinDay("2026-10-18T21:59:00Z")).toBe("2026-10-18");
  });

  it("und nach der Zeitumstellung mit UTC+1", () => {
    expect(berlinDay("2026-11-01T23:30:00Z")).toBe("2026-11-02");
    expect(berlinDay("2026-11-01T22:59:00Z")).toBe("2026-11-01");
  });
});

describe("Tage", () => {
  it("rechnet über Monatsgrenzen", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-10-01", -1)).toBe("2026-09-30");
    expect(dayRange("2026-10-30", "2026-11-02")).toEqual(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
    expect(dayRange("2026-10-02", "2026-10-01")).toEqual([]);
  });
});

describe("filterRows / previousPeriod", () => {
  const rows = [
    row({ day: "2026-10-10" }),
    row({ day: "2026-10-12", channel: "Meta", campaign: "norden" }),
    row({ day: "2026-10-14" }),
    row({ day: "2026-10-15", channel: "Meta", campaign: "norden" }),
  ];
  const f = { from: "2026-10-14", to: "2026-10-15", channel: "", campaign: "" };

  it("filtert nach Zeitraum, Kanal und Kampagne", () => {
    expect(filterRows(rows, f)).toHaveLength(2);
    expect(filterRows(rows, { ...f, channel: "Meta" })).toHaveLength(1);
    expect(filterRows(rows, { ...f, from: "2026-10-01", campaign: "norden" })).toHaveLength(2);
  });

  it("Vorperiode = gleich lange Spanne direkt davor", () => {
    expect(previousPeriod(rows, f).map((r) => r.day)).toEqual(["2026-10-12"]);
  });
});

describe("tally / qualifiedRate", () => {
  it("Quote nur über bewertete Anfragen", () => {
    const t = tally([{ outcome: "qualified" }, { outcome: "not_qualified" }, { outcome: "unreachable" }, { outcome: null }]);
    expect(t).toEqual({ total: 4, rated: 3, qualified: 1, notQualified: 1, unreachable: 1, open: 1 });
    expect(formatRate(qualifiedRate(t))).toBe("33 %");
    expect(formatRate(qualifiedRate(tally([{ outcome: null }])))).toBe("–");
  });
});

describe("compareTable", () => {
  it("gruppiert Kanal → Kampagne, nach Anzahl absteigend", () => {
    const table = compareTable([
      row({ channel: "Meta", campaign: "norden", outcome: "qualified" }),
      row({ channel: "Google Ads", campaign: "hamburg" }),
      row({ channel: "Meta", campaign: "bundesweit" }),
      row({ channel: "Meta", campaign: "norden", outcome: "not_qualified" }),
    ]);
    expect(table.map((c) => [c.channel, c.tally.total])).toEqual([
      ["Meta", 3],
      ["Google Ads", 1],
    ]);
    expect(table[0].campaigns.map((c) => [c.campaign, c.tally.total, c.tally.qualified])).toEqual([
      ["norden", 2, 1],
      ["bundesweit", 1, 0],
    ]);
  });
});

describe("kpis", () => {
  it("Menge, Quote, meiste Anfragen, Kampagnen", () => {
    const rows = [
      row({ channel: "Meta", campaign: "norden", outcome: "qualified" }),
      row({ channel: "Meta", campaign: "Kampagne unbekannt", outcome: "unreachable" }),
      row({ channel: "Google Ads", campaign: "hamburg" }),
      row({ channel: "Direkt", campaign: "Ohne Kampagne", fromCampaign: false }),
    ];
    expect(kpis(rows, [row({})])).toEqual({
      total: 4,
      delta: 3,
      qualified: 1,
      rated: 2,
      rate: 0.5,
      topChannel: { name: "Meta", count: 2, share: 0.5 },
      campaigns: 2,
      withoutCampaign: 1,
    });
    expect(kpis([], null)).toMatchObject({ total: 0, delta: null, topChannel: null, rate: null });
  });
});

describe("filterOptions", () => {
  it("Kampagnen nur des gewählten Kanals", () => {
    const rows = [row({ channel: "Meta", campaign: "norden" }), row({ channel: "Google Ads", campaign: "hamburg" }), row({ channel: "Meta", campaign: "norden" })];
    expect(filterOptions(rows, "")).toEqual({ channels: ["Meta", "Google Ads"], campaigns: ["norden", "hamburg"] });
    expect(filterOptions(rows, "Google Ads").campaigns).toEqual(["hamburg"]);
  });
});
