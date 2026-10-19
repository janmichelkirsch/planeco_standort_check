"use client";

import type { ReactNode } from "react";
import { Donut } from "@/components/dashboard/analyse/charts";
import { cardClass } from "@/components/dashboard/ui";
import { formatRate, qualifiedRate, tally, type AnalyseRow } from "@/lib/analyse";

/** Karten unter dem Verlauf: Rückmeldung (Ring über die bewerteten Anfragen) und Datenqualität (Adresse, Mail, Herkunft). */
export function Insights({ rows }: { rows: AnalyseRow[] }) {
  const t = tally(rows);
  // Ring und Prozente nur über bewertete Anfragen – so passen sie zur Quote in der Mitte.
  const parts = [
    { label: "Qualifiziert", n: t.qualified, color: "#2f6b4f" },
    { label: "Nicht qualifiziert", n: t.notQualified, color: "#7a8b86" },
    { label: "Nicht erreicht", n: t.unreachable, color: "#d9a441" },
  ];
  const count = (pred: (r: AnalyseRow) => boolean) => rows.filter(pred).length;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6">
      <Card title="Rückmeldung" hint="Was Sales nach dem Gespräch als Ergebnis einträgt">
        <div className="flex items-center gap-8">
          <Donut parts={parts}>
            <div>
              <p className="text-[28px] leading-none font-semibold tracking-tight tabular-nums">{formatRate(qualifiedRate(t))}</p>
              <p className="mt-1 text-[11px] text-forest-soft">qualifiziert</p>
            </div>
          </Donut>
          <ul className="min-w-0 flex-1 space-y-2.5 text-sm">
            {parts.map((p) => (
              <li key={p.label} className="flex items-center gap-2.5">
                <span className="size-3 shrink-0 rounded-full" style={{ background: p.color }} />
                <span className="flex-1 text-forest-soft">{p.label}</span>
                <span className="font-semibold tabular-nums">{p.n}</span>
                <span className="w-12 text-right text-xs text-forest-muted tabular-nums">{formatRate(t.rated ? p.n / t.rated : null)}</span>
              </li>
            ))}
            <li className="flex items-center gap-2.5 border-t border-line-soft pt-2.5">
              <span className="size-3 shrink-0 rounded-full border border-dashed border-line" />
              <span className="flex-1 text-forest-soft">Noch kein Ergebnis</span>
              <span className="font-semibold tabular-nums">{t.open}</span>
              <span className="w-12" />
            </li>
          </ul>
        </div>
      </Card>

      <Card title="Datenqualität" hint="Wie verlässlich die Angaben hinter den Zahlen sind">
        <div className="grid grid-cols-3 gap-6">
          <Quality
            title="Adresse"
            parts={[
              { label: "genau gefunden", n: count((r) => r.plot === "exact"), cls: "bg-ok" },
              { label: "nur Ort", n: count((r) => r.plot === "town_only"), cls: "bg-warn-line" },
              { label: "nicht gefunden", n: count((r) => r.plot === "not_found"), cls: "bg-danger" },
              { label: "wird nachgeschlagen", n: count((r) => r.plot === "pending"), cls: "bg-line" },
              { label: "fehlgeschlagen", n: count((r) => r.plot === "failed"), cls: "bg-coral-strong" },
            ]}
          />
          <Quality
            title="Bestätigungsmail"
            parts={[
              { label: "gesendet", n: count((r) => r.mail === "sent"), cls: "bg-ok" },
              { label: "ausstehend", n: count((r) => r.mail === "pending"), cls: "bg-warn-line" },
              { label: "fehlgeschlagen", n: count((r) => r.mail === "failed"), cls: "bg-danger" },
            ]}
          />
          <Quality
            title="Herkunft"
            parts={[
              { label: "aus einer Kampagne", n: count((r) => r.fromCampaign), cls: "bg-forest" },
              { label: "ohne", n: count((r) => !r.fromCampaign), cls: "bg-line" },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className={`${cardClass} p-6`}>
      <header className="mb-5">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-0.5 text-[13px] text-forest-soft">{hint}</p>
      </header>
      {children}
    </section>
  );
}

function Quality({ title, parts }: { title: string; parts: { label: string; n: number; cls: string }[] }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-2.5 flex h-2 gap-0.5" aria-hidden="true">
        {parts
          .filter((p) => p.n > 0)
          .map((p) => (
            <span key={p.label} className={`rounded-sm ${p.cls}`} style={{ flexGrow: p.n, flexBasis: 0 }} />
          ))}
      </div>
      <ul className="mt-3 space-y-1.5 text-[13px]">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${p.cls}`} />
            <span className="flex-1 text-forest-soft">{p.label}</span>
            <span className={`font-semibold tabular-nums ${p.n ? "" : "text-forest-muted"}`}>{p.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
