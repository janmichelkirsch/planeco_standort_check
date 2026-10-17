import { Suspense } from "react";
import { logout } from "@/app/admin/actions";
import { LeadsTable } from "@/components/LeadsTable";
import { requireSalesUser } from "@/lib/auth";
import { DEFAULT_SORT, fetchLeadsPage } from "@/lib/leads";

type SessionClient = Awaited<ReturnType<typeof requireSalesUser>>["supabase"];

/** Lädt die Anfragen und fängt Fehler ab, damit die Seite eine Meldung statt eines Absturzes zeigt. */
async function loadLeads(supabase: SessionClient) {
  try {
    const { rows, hasMore } = await fetchLeadsPage(supabase, DEFAULT_SORT);
    return { ok: true as const, rows, hasMore };
  } catch (error) {
    console.error("[admin] Anfragen konnten nicht geladen werden", error);
    return { ok: false as const };
  }
}

async function AdminContent() {
  const { supabase, email } = await requireSalesUser();

  const result = await loadLeads(supabase);

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
        <LeadsTable rows={result.rows} hasMore={result.hasMore} />
      ) : (
        <p className="text-red-700">Anfragen konnten nicht geladen werden. Bitte Seite neu laden.</p>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Standort-Check – Anfragen</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Lade …</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
