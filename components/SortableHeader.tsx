import Link from "next/link";
import type { Sort, SortColumn, View } from "@/lib/dashboard";

type Props = {
  label: string;
  column: SortColumn;
  current: Sort;
  view: View;
  className?: string;
};

/** Spaltenüberschrift als Link: erster Klick sortiert, weiterer Klick dreht die Richtung um. Die Ansicht bleibt erhalten. */
export function SortableHeader({ label, column, current, view, className = "" }: Props) {
  const isActive = current.column === column;
  const nextDirection = isActive ? (current.direction === "asc" ? "desc" : "asc") : column === "latest" ? "desc" : "asc";
  const arrow = isActive ? (current.direction === "asc" ? " ▲" : " ▼") : "";

  return (
    <span className={className} aria-sort={isActive ? (current.direction === "asc" ? "ascending" : "descending") : undefined}>
      <Link href={`/admin?view=${view}&sort=${column}&dir=${nextDirection}`} className="whitespace-nowrap underline-offset-2 hover:underline">
        {label}
        {arrow}
      </Link>
    </span>
  );
}
