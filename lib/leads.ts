import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Eine Anfrage, wie sie in der Tabelle `leads` steht. */
export type LeadRow = {
  id: string;
  created_at: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  address_source: "photon" | "manual";
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
};

export type SortDirection = "asc" | "desc";

/** Spalten, nach denen im Dashboard sortiert werden darf (Whitelist gegen beliebige Eingaben aus der URL). */
export const SORTABLE_COLUMNS = ["created_at", "last_name", "email", "postal_code", "state", "address_source"] as const;
export type SortColumn = (typeof SORTABLE_COLUMNS)[number];

export const DEFAULT_SORT: { column: SortColumn; direction: SortDirection } = { column: "created_at", direction: "desc" };

/** Liest die Sortierung aus der URL (`?sort=…&dir=…`). Unbekannte Werte fallen auf den Standard zurück. */
export function parseSort(params: { sort?: string | string[]; dir?: string | string[] }) {
  const column = SORTABLE_COLUMNS.find((c) => c === params.sort) ?? DEFAULT_SORT.column;
  const direction: SortDirection =
    params.dir === "asc" || params.dir === "desc" ? params.dir : column === DEFAULT_SORT.column ? DEFAULT_SORT.direction : "asc";
  return { column, direction };
}

// Supabase liefert pro Abfrage höchstens 1000 Zeilen. Größere Mengen werden seitenweise geholt.
const PAGE_SIZE = 1000;

/** Liest eine Seite Anfragen. `hasMore` zeigt an, ob es weitere Zeilen gibt. */
export async function fetchLeadsPage(
  supabase: SupabaseClient,
  sort: { column: SortColumn; direction: SortDirection },
  page = 0,
): Promise<{ rows: LeadRow[]; hasMore: boolean }> {
  const from = page * PAGE_SIZE;
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    // Leere Werte (z. B. Bundesland bei manueller Adresse) immer ans Ende, in beide Richtungen.
    .order(sort.column, { ascending: sort.direction === "asc", nullsFirst: false })
    // Stabile Reihenfolge bei gleichen Werten, damit beim Blättern nichts doppelt kommt oder fehlt.
    .order("id", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);

  if (error) throw error;
  const rows = (data ?? []) as LeadRow[];
  return { rows, hasMore: rows.length === PAGE_SIZE };
}

/** Liest alle Anfragen, Seite für Seite (für den Export). */
export async function fetchAllLeads(
  supabase: SupabaseClient,
  sort: { column: SortColumn; direction: SortDirection },
): Promise<LeadRow[]> {
  const all: LeadRow[] = [];
  for (let page = 0; ; page++) {
    const { rows, hasMore } = await fetchLeadsPage(supabase, sort, page);
    all.push(...rows);
    if (!hasMore) return all;
  }
}
