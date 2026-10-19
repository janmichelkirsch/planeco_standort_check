import type { ReactNode } from "react";
import { Sparkline } from "@/components/dashboard/analyse/charts";
import { cardClass } from "@/components/dashboard/ui";
import { formatRate, type Kpis as KpiValues } from "@/lib/analyse";

type Spark = { total: number[]; qualified: number[] };

/** Vier Kacheln über der Tabelle: Anfragen, Qualifiziert, Meiste Anfragen, Kampagnen mit Anfragen. */
export function Kpis({ k, days, pendingReview, spark }: { k: KpiValues; days: number; pendingReview: number; spark?: Spark }) {
  const delta =
    k.delta === null ? `in ${days === 1 ? "1 Tag" : `${days} Tagen`}` : `${k.delta > 0 ? "+" : k.delta < 0 ? "−" : "±"}${Math.abs(k.delta)} zur Vorperiode`;
  return (
    <div className="grid grid-cols-4 gap-4">
      <Kpi label="Anfragen" value={String(k.total)} spark={spark?.total}>
        {delta}
        {pendingReview > 0 && ` · ${pendingReview} in Prüfung`}
      </Kpi>
      <Kpi label="Qualifiziert" value={String(k.qualified)} accent spark={spark?.qualified} sparkColor="#2f6b4f">
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

type KpiProps = { label: string; value: string; accent?: boolean; small?: boolean; spark?: number[]; sparkColor?: string; children: ReactNode };

function Kpi({ label, value, accent, small, spark, sparkColor, children }: KpiProps) {
  return (
    <div className={`${cardClass} p-5`}>
      <p className="text-[13px] font-medium text-forest-soft">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p
          className={`min-w-0 truncate leading-none font-semibold tracking-tight tabular-nums ${small ? "text-[26px]" : "text-[34px]"} ${accent ? "text-ok" : ""}`}
          title={value}
        >
          {value}
        </p>
        {spark && <Sparkline values={spark} color={sparkColor} />}
      </div>
      <p className="mt-2.5 text-[13px] text-forest-soft">{children}</p>
    </div>
  );
}
