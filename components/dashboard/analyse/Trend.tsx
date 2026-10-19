"use client";

import { useState } from "react";
import { DataTable, LineChart, type Series } from "@/components/dashboard/analyse/charts";
import { Segmented } from "@/components/dashboard/analyse/Segmented";
import { cardClass } from "@/components/dashboard/ui";
import { cumulative, perDay, type AnalyseRow } from "@/lib/analyse";

type Group = "gesamt" | "kanal" | "kampagne";
type Mode = "taeglich" | "kumuliert";

const CHANNEL_COLOR: Record<string, string> = {
  "Google Ads": "#0b8a6c",
  Meta: "#3d78c8",
  Newsletter: "#b9791a",
  Verweis: "#a8559e",
  Direkt: "#7a8b86",
};
const PALETTE = ["#0b8a6c", "#3d78c8", "#b9791a", "#a8559e", "#d0583f", "#0e8fa8"];
const FALLBACK = "#556b66";

export const short = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}.`;
const longDay = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });

function countBy(rows: AnalyseRow[], key: (r: AnalyseRow) => string) {
  const m = new Map<string, AnalyseRow[]>();
  for (const r of rows) m.set(key(r), [...(m.get(key(r)) ?? []), r]);
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "de"));
}

/** Anfragen pro Tag: gesamt, nach Kanal oder nach Kampagne; alle oder nur qualifizierte; täglich oder aufsummiert. Linien ein-/ausblendbar. */
export function Trend({ rows, days }: { rows: AnalyseRow[]; days: string[] }) {
  const [group, setGroup] = useState<Group>("kanal");
  const [mode, setMode] = useState<Mode>("taeglich");
  const [onlyQualified, setOnlyQualified] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);

  const items = onlyQualified ? rows.filter((r) => r.outcome === "qualified") : rows;
  const shape = (v: number[]) => (mode === "kumuliert" ? cumulative(v) : v);
  const series: Series[] =
    group === "gesamt"
      ? [{ key: "all", label: "Alle Anfragen", color: "#22403b", values: shape(perDay(items, days)) }]
      : countBy(items, (r) => (group === "kanal" ? r.channel : r.campaign)).map(([key, xs], i) => ({
          key,
          label: key,
          color: group === "kanal" ? (CHANNEL_COLOR[key] ?? FALLBACK) : PALETTE[i % PALETTE.length],
          values: shape(perDay(xs, days)),
        }));
  const visible = series.filter((s) => !hidden.includes(s.key));
  const totals = perDay(rows, days);
  const maxDay = Math.max(0, ...totals);

  return (
    <section className={`${cardClass} p-6`}>
      <header className="mb-5 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 className="font-semibold">Anfragen im Verlauf</h2>
          <p className="mt-0.5 text-[13px] text-forest-soft">
            {onlyQualified ? "Qualifizierte Anfragen" : "Anfragen"} {mode === "kumuliert" ? "aufsummiert über den Zeitraum" : "pro Tag"}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
          <Segmented
            label="Gruppierung"
            size="sm"
            value={group}
            onChange={(g) => {
              setGroup(g);
              setHidden([]);
            }}
            options={[
              { id: "gesamt", label: "Gesamt" },
              { id: "kanal", label: "Nach Kanal" },
              { id: "kampagne", label: "Nach Kampagne" },
            ]}
          />
          <Segmented
            label="Ergebnis"
            size="sm"
            value={onlyQualified ? "q" : "alle"}
            onChange={(v) => setOnlyQualified(v === "q")}
            options={[
              { id: "alle", label: "Alle Anfragen" },
              { id: "q", label: "Nur qualifizierte" },
            ]}
          />
          <Segmented
            label="Darstellung"
            size="sm"
            value={mode}
            onChange={setMode}
            options={[
              { id: "taeglich", label: "Täglich" },
              { id: "kumuliert", label: "Kumuliert" },
            ]}
          />
        </div>
      </header>

      {group !== "gesamt" && (
        <ul className="mb-3 flex flex-wrap gap-2" aria-label="Linien ein- und ausblenden">
          {series.map((s) => {
            const off = hidden.includes(s.key);
            return (
              <li key={s.key}>
                <button
                  type="button"
                  aria-pressed={!off}
                  onClick={() => setHidden(off ? hidden.filter((k) => k !== s.key) : [...hidden, s.key])}
                  className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                    off ? "border-line-soft text-forest-muted line-through" : "border-line bg-white text-forest hover:border-forest"
                  }`}
                >
                  <span className="size-2.5 rounded-full" style={{ background: off ? "#dde3da" : s.color }} />
                  {s.label}
                  <span className="font-semibold tabular-nums">{items.filter((r) => (group === "kanal" ? r.channel : r.campaign) === s.key).length}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <LineChart
        days={days}
        series={visible}
        height={320}
        tickLabel={short}
        tooltipDay={longDay}
        unit={mode === "kumuliert" ? "Anfragen insgesamt bis zu diesem Tag" : "Anfragen an diesem Tag"}
        ariaLabel={`Anfragen im Verlauf vom ${short(days[0])} bis ${short(days[days.length - 1])}, ${visible.map((s) => s.label).join(", ")}`}
      />
      <DataTable caption="Anfragen pro Tag" days={days} series={visible} dayLabel={longDay} />
      <p className="mt-4 border-t border-line-soft pt-4 text-[13px] text-forest-soft">
        {rows.length} Anfragen in {days.length} Tagen · Ø {(rows.length / days.length).toLocaleString("de-DE", { maximumFractionDigits: 1 })} pro Tag
        {maxDay > 0 && ` · stärkster Tag ${short(days[totals.indexOf(maxDay)])} mit ${maxDay}`}
      </p>
    </section>
  );
}
