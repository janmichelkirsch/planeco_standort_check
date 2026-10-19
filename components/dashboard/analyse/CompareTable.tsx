import { cardClass } from "@/components/dashboard/ui";
import { LOW_DATA, formatRate, qualifiedRate, type ChannelLine, type Tally } from "@/lib/analyse";

const COLS = "grid grid-cols-[minmax(0,2.2fr)_repeat(5,minmax(0,0.8fr))_minmax(0,1fr)] items-center gap-4";

/**
 * Kern der Analyse: Welche Kanäle und Kampagnen bringen Anfragen – und wie viele davon sind qualifiziert?
 * Zeile pro Kanal, darunter eingerückt die Kampagnen. Quote = qualifiziert ÷ Anfragen mit Ergebnis.
 */
export function CompareTable({ table }: { table: ChannelLine[] }) {
  return (
    <section className={`${cardClass} p-6`}>
      <header className="mb-4">
        <h2 className="font-semibold">Welche Kanäle und Kampagnen etwas taugen</h2>
        <p className="mt-0.5 text-[13px] text-forest-soft">Anfragen und das Ergebnis, das Sales nach dem Gespräch einträgt</p>
      </header>

      <div role="table" aria-label="Kanäle und Kampagnen im Vergleich" className="text-sm">
        <div role="row" className={`${COLS} border-b border-line-soft pb-2 text-xs font-medium text-forest-soft`}>
          <span role="columnheader">Kanal / Kampagne</span>
          <span role="columnheader" className="text-right">
            Anfragen
          </span>
          <span role="columnheader" className="text-right">
            mit Ergebnis
          </span>
          <span role="columnheader" className="text-right">
            qualifiziert
          </span>
          <span role="columnheader" className="text-right">
            nicht qualifiziert
          </span>
          <span role="columnheader" className="text-right">
            nicht erreicht
          </span>
          <span role="columnheader" className="text-right">
            Quote
          </span>
        </div>
        {table.map((c) => (
          <div key={c.channel} role="rowgroup" className="border-b border-line-soft last:border-b-0">
            <Line label={c.channel} tally={c.tally} strong />
            {c.campaigns.map((k) => (
              <Line key={k.campaign} label={k.campaign} tally={k.tally} />
            ))}
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-line-soft pt-4 text-[13px] text-forest-soft">
        Quote = qualifiziert ÷ Anfragen mit Ergebnis. Unter {LOW_DATA} bewerteten Anfragen ist sie grau („wenig Daten“).
        Ohne Werbekosten gibt es keine Kosten pro Anfrage.
      </p>
    </section>
  );
}

function Line({ label, tally: t, strong }: { label: string; tally: Tally; strong?: boolean }) {
  const rate = qualifiedRate(t);
  const low = t.rated < LOW_DATA;
  return (
    <div role="row" className={`${COLS} py-2.5 tabular-nums ${strong ? "font-semibold" : "text-forest-soft"}`}>
      <span role="cell" className={`truncate ${strong ? "" : "pl-5"}`} title={label}>
        {label}
      </span>
      <span role="cell" className="text-right">
        {t.total}
      </span>
      <span role="cell" className="text-right">
        {t.rated}
      </span>
      <span role="cell" className={`text-right ${strong ? "text-ok" : ""}`}>
        {t.qualified}
      </span>
      <span role="cell" className="text-right">
        {t.notQualified}
      </span>
      <span role="cell" className="text-right">
        {t.unreachable}
      </span>
      <span role="cell" className={`text-right ${rate !== null && low ? "text-forest-muted" : ""}`}>
        {formatRate(rate)}
        {rate !== null && low && <span className="block text-[11px] font-normal">wenig Daten</span>}
      </span>
    </div>
  );
}
