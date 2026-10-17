import { Suspense } from "react";
import { logout } from "@/app/admin/actions";
import { LeadsTable } from "@/components/LeadsTable";
import { requireSalesUser } from "@/lib/auth";
import { fetchLeadsPage, parseSort, type SortColumn, type SortDirection } from "@/lib/leads";

type SearchParams = Promise<{ sort?: string | string[]; dir?: string | string[] }>;
type SessionClient = Awaited<ReturnType<typeof requireSalesUser>>["supabase"];

/** Lädt die Anfragen und fängt Fehler ab, damit die Seite eine Meldung statt eines Absturzes zeigt. */
async function loadLeads(supabase: SessionClient, sort: { column: SortColumn; direction: SortDirection }) {
  try {
    const { rows, hasMore } = await fetchLeadsPage(supabase, sort);
    return { ok: true as const, rows, hasMore };
  } catch (error) {
    console.error("[admin] Anfragen konnten nicht geladen werden", error);
    return { ok: false as const };
  }
}

async function AdminContent({ searchParams }: { searchParams: SearchParams }) {
  const { supabase, email } = await requireSalesUser();
  const sort = parseSort(await searchParams);
  const result = await loadLeads(supabase, sort);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-600">Eingeloggt als {email}</p>
        <form action={logout}>
          <button type="submit" className="text-sm underline">
            Abmelden
          </button>
        </form>
      </div>
      {result.ok ? (
        <LeadsTable rows={result.rows} hasMore={result.hasMore} sort={sort} />
      ) : (
        <p className="text-red-700">Anfragen konnten nicht geladen werden. Bitte Seite neu laden.</p>
      )}
    </div>
  );
}

export default function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Standort-Check – Anfragen</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Lade …</p>}>
        <AdminContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
