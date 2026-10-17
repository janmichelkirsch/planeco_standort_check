import type { ReactNode } from "react";
import type { Sort, View } from "@/lib/dashboard";

/** Kleine Bausteine des Dashboards. */

const TONE = {
  amber: "bg-amber-100 text-amber-900",
  blue: "bg-sky-100 text-sky-900",
  green: "bg-green-100 text-green-900",
  zinc: "bg-zinc-100 text-zinc-800",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof TONE; children: ReactNode }) {
  return <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${TONE[tone]}`}>{children}</span>;
}

export function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Damit ein Formular nach dem Speichern in dieselbe Ansicht und Sortierung zurückkehrt. */
export function ReturnFields({ view, sort }: { view: View; sort: Sort }) {
  return (
    <>
      <input type="hidden" name="view" value={view} />
      <input type="hidden" name="sort" value={sort.column} />
      <input type="hidden" name="dir" value={sort.direction} />
    </>
  );
}

export const selectClass = "rounded border border-zinc-300 bg-white px-2 py-1 text-sm";
export const buttonClass = "rounded bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white";
