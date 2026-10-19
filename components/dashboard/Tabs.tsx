import Link from "next/link";
import { VIEWS, VIEW_LABEL, type Sort, type View } from "@/lib/dashboard";

/**
 * Reiter Offen / Nicht zugewiesen / Meine / Alle mit Anzahl Kontakte. Die Sortierung bleibt beim Wechsel erhalten,
 * ein gemerkter Kontakt (`keep`) nicht. „Nicht zugewiesen“ ist koralle, solange dort jemand wartet.
 */
export function Tabs({ current, counts, sort, visible }: { current: View; counts: Record<View, number>; sort: Sort; visible: number }) {
  return (
    <div className="mt-8 flex items-end justify-between border-b border-line-soft">
      <nav aria-label="Ansicht" className="-mb-px flex gap-1">
        {VIEWS.map((view) => {
          const active = view === current;
          const urgent = view === "unassigned" && counts.unassigned > 0;
          return (
            <Link
              key={view}
              href={`/admin?view=${view}&sort=${sort.column}&dir=${sort.direction}`}
              aria-current={active ? "page" : undefined}
              className={`flex h-12 items-center gap-2 rounded-t-lg border-b-2 px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest ${
                active ? "border-forest font-semibold text-forest" : "border-transparent text-forest-soft hover:text-forest"
              }`}
            >
              {VIEW_LABEL[view]}
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                  urgent ? "bg-coral-strong text-white" : active ? "bg-forest text-white" : "bg-sage-deep text-forest"
                }`}
              >
                {counts[view]}
              </span>
            </Link>
          );
        })}
      </nav>
      <p className="pb-3 text-[13px] text-forest-soft">{visible === 1 ? "1 Kontakt" : `${visible} Kontakte`}</p>
    </div>
  );
}
