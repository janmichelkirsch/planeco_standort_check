import type { ReactNode } from "react";
import { cardClass } from "@/components/dashboard/ui";
import { formatRate, type Kpis as KpiValues } from "@/lib/analyse";

/** Vier Kacheln über der Tabelle: Anfragen, Qualifiziert, Meiste Anfragen, Kampagnen mit Anfragen. */
export function Kpis({ k, days, pendingReview }: { k: KpiValues; days: number; pendingReview: number }) {
  const delta =
    k.delta === null ? `in ${days === 1 ? "1 Tag" : `${days} Tagen`}` : `${k.delta > 0 ? "+" : k.delta < 0 ? "−" : "±"}${Math.abs(k.delta)} zur Vorperiode`;
  return (
    <div className="grid grid-cols-4 gap-4">
      <Kpi label="Anfragen" value={String(k.total)}>
        {delta}
        {pendingReview > 0 && ` · ${pendingReview} in Prüfung`}
      </Kpi>
      <Kpi label="Qualifiziert" value={String(k.qualified)} accent>
        {k.rated === 0 ? "noch keine bewertet" : `${formatRate(k.rate)} der ${k.rated} bewerteten`}
      </Kpi>
      <Kpi label="Meiste Anfragen" value={k.topChannel?.name ?? "–"} small>
        {k.topChannel ? `${k.topChannel.count} Anfragen · ${formatRate(k.topChannel.share)}` : ""}
      </Kpi>
      <Kpi label="Kampagnen mit Anfragen" value={String(k.campaigns)} small>
        {k.withoutCampaign > 0 ? `+ ${k.withoutCampaign} ohne Kampagne` : "alle mit Kampagnen-Parametern"}
      </Kpi>
    </div>
  );
}

function Kpi({ label, value, accent, small, children }: { label: string; value: string; accent?: boolean; small?: boolean; children: ReactNode }) {
  return (
    <div className={`${cardClass} p-5`}>
      <p className="text-[13px] font-medium text-forest-soft">{label}</p>
      <p
        className={`mt-2 truncate leading-none font-semibold tracking-tight tabular-nums ${small ? "text-[26px]" : "text-[34px]"} ${accent ? "text-ok" : ""}`}
        title={value}
      >
        {value}
      </p>
      <p className="mt-2.5 text-[13px] text-forest-soft">{children}</p>
    </div>
  );
}
