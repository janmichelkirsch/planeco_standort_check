"use client";

import { useState } from "react";
import { Chart } from "@/components/icons";
import { Insights } from "@/components/dashboard/analyse/Insights";
import { Kpis } from "@/components/dashboard/analyse/Kpis";
import { Segmented } from "@/components/dashboard/analyse/Segmented";
import { Trend } from "@/components/dashboard/analyse/Trend";
import { Select, cardClass } from "@/components/dashboard/ui";
import { addDays, dayRange, filterOptions, filterRows, kpis, perDay, previousPeriod, type AnalyseRow } from "@/lib/analyse";

const PRESETS = [
  { id: "7", label: "7 Tage", days: 7 },
  { id: "14", label: "14 Tage", days: 14 },
  { id: "30", label: "30 Tage", days: 30 },
  { id: "all", label: "Gesamt", days: 0 },
] as const;
type Preset = (typeof PRESETS)[number];

/**
 * Analyse (Case Pflicht 6): Zeitraum, Kanal und Kampagne filtern; Kacheln und Vergleichstabelle.
 * `today` kommt vom Server (Berliner Datum), damit Server und Browser denselben Tag rechnen.
 */
export function Analyse({ rows, today, pendingReview }: { rows: AnalyseRow[]; today: string; pendingReview: number }) {
  const earliest = rows.reduce((m, r) => (r.day < m ? r.day : m), today);
  // Standard „Gesamt“ wie im Entwurf: Bei wenigen Daten sagt ein kurzer Zeitraum wenig.
  const [from, setFrom] = useState(earliest);
  const [to, setTo] = useState(today);
  const [channel, setChannel] = useState("");
  const [campaign, setCampaign] = useState("");

  const presetFrom = (p: Preset) => (p.days ? addDays(today, -(p.days - 1)) : earliest);
  const activePreset = PRESETS.find((p) => presetFrom(p) === from && to === today)?.id;
  const filter = { from, to, channel, campaign };
  const items = filterRows(rows, filter);
  const isAll = activePreset === "all";
  const options = filterOptions(rows, channel);
  const days = dayRange(from, to);

  return (
    <div>
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">Analyse</h1>
      <p className="mt-1.5 max-w-2xl text-forest-soft">Welche Kanäle und Kampagnen Anfragen bringen und wie viele davon qualifiziert sind.</p>

      <div className={`mt-7 flex flex-wrap items-end gap-x-6 gap-y-4 p-4 ${cardClass}`}>
        <div>
          <span className="mb-1.5 block text-xs font-medium text-forest-soft">Zeitraum</span>
          <div className="flex items-center gap-3">
            <Segmented
              label="Zeitraum wählen"
              value={activePreset}
              options={PRESETS.map((p) => ({ id: p.id, label: p.label }))}
              onChange={(id) => {
                const p = PRESETS.find((x) => x.id === id)!;
                setFrom(presetFrom(p));
                setTo(today);
              }}
            />
            <div className="flex items-center gap-2 text-sm text-forest-soft">
              <DateInput label="Von" value={from} min={earliest} max={to} onChange={setFrom} />
              <span aria-hidden="true">–</span>
              <DateInput label="Bis" value={to} min={from} max={today} onChange={setTo} />
            </div>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <Select
            id="analyse-channel"
            label="Kanal"
            value={channel}
            className="w-52"
            onChange={(e) => {
              const next = e.target.value;
              setChannel(next);
              if (campaign && next && !rows.some((r) => r.channel === next && r.campaign === campaign)) setCampaign("");
            }}
          >
            <option value="">Alle Kanäle</option>
            {options.channels.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select id="analyse-campaign" label="Kampagne" value={campaign} className="w-60" onChange={(e) => setCampaign(e.target.value)}>
            <option value="">Alle Kampagnen</option>
            {options.campaigns.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-line-soft">
          <span className="grid size-14 place-items-center rounded-full bg-sage text-forest">
            <Chart className="size-7" />
          </span>
          <p className="mt-4 text-lg font-semibold">Keine Anfragen in dieser Auswahl</p>
          <p className="mt-1 max-w-sm text-sm text-forest-soft">Wähle einen anderen Zeitraum oder setze Kanal und Kampagne zurück.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <Kpis
            k={kpis(items, isAll ? null : previousPeriod(rows, filter))}
            days={days.length}
            pendingReview={pendingReview}
            spark={{ total: perDay(items, days), qualified: perDay(items.filter((r) => r.outcome === "qualified"), days) }}
          />
          <Trend rows={items} days={days} />
          <Insights rows={items} />
        </div>
      )}
    </div>
  );
}

function DateInput({ label, value, min, max, onChange }: { label: string; value: string; min: string; max: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      aria-label={label}
      value={value}
      min={min}
      max={max}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      className="h-11 rounded-xl border border-line bg-white px-3 text-sm text-forest tabular-nums outline-none hover:border-forest-soft focus:border-forest focus:ring-4 focus:ring-forest/12"
    />
  );
}
