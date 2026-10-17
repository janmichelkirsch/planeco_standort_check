import Link from "next/link";
import type { SortColumn, SortDirection } from "@/lib/leads";

type Props = {
  label: string;
  column: SortColumn;
  current: { column: SortColumn; direction: SortDirection };
};

/** Spaltenüberschrift als Link: erster Klick sortiert, weiterer Klick dreht die Richtung um. */
export function SortableHeader({ label, column, current }: Props) {
  const isActive = current.column === column;
  const nextDirection: SortDirection = isActive ? (current.direction === "asc" ? "desc" : "asc") : column === "created_at" ? "desc" : "asc";
  const arrow = isActive ? (current.direction === "asc" ? " ▲" : " ▼") : "";

  return (
    <th className="px-3 py-2" aria-sort={isActive ? (current.direction === "asc" ? "ascending" : "descending") : undefined}>
      <Link href={`/admin?sort=${column}&dir=${nextDirection}`} className="whitespace-nowrap underline-offset-2 hover:underline">
        {label}
        {arrow}
      </Link>
    </th>
  );
}
