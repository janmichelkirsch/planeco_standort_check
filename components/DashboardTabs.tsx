import Link from "next/link";
import { VIEWS, VIEW_LABEL, type Sort, type View } from "@/lib/dashboard";

/** Reiter „Offen / Nicht zugewiesen / Meine / Alle“ mit Anzahl Kontakte. Die Sortierung bleibt beim Wechsel erhalten. */
export function DashboardTabs({ current, counts, sort }: { current: View; counts: Record<View, number>; sort: Sort }) {
  return (
    <nav aria-label="Ansicht" className="flex flex-wrap gap-1 border-b border-zinc-300">
      {VIEWS.map((view) => {
        const active = view === current;
        return (
          <Link
            key={view}
            href={`/admin?view=${view}&sort=${sort.column}&dir=${sort.direction}`}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              active ? "border-zinc-900 font-semibold text-zinc-900" : "border-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {VIEW_LABEL[view]} <span className="text-zinc-500">({counts[view]})</span>
          </Link>
        );
      })}
    </nav>
  );
}
