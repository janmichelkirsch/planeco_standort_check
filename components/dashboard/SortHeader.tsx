import Link from "next/link";
import { SortArrows, SortDown, SortUp } from "@/components/icons";
import type { Sort, SortColumn, View } from "@/lib/dashboard";

/** Spaltenüberschrift als Link: erster Klick sortiert, weiterer Klick dreht die Richtung um. Ansicht bleibt, gemerkter Kontakt nicht. */
export function SortHeader({ label, column, current, view }: { label: string; column: SortColumn; current: Sort; view: View }) {
  const active = current.column === column;
  const next = active ? (current.direction === "asc" ? "desc" : "asc") : column === "latest" ? "desc" : "asc";
  const Icon = !active ? SortArrows : current.direction === "asc" ? SortUp : SortDown;
  return (
    <span aria-sort={active ? (current.direction === "asc" ? "ascending" : "descending") : "none"}>
      <Link
        href={`/admin?view=${view}&sort=${column}&dir=${next}`}
        className={`-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-sage hover:text-forest focus-visible:outline-2 focus-visible:outline-forest ${
          active ? "font-semibold text-forest" : ""
        }`}
      >
        {label}
        <Icon className={`size-3.5 ${active ? "" : "opacity-60"}`} />
      </Link>
    </span>
  );
}
