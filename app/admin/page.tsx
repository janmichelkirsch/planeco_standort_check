import { Suspense } from "react";
import { logout } from "@/app/admin/actions";
import { ContactList } from "@/components/ContactList";
import { DashboardTabs } from "@/components/DashboardTabs";
import { IntakeNotices } from "@/components/IntakeNotices";
import { requireSalesUser } from "@/lib/auth";
import { VIEWS, countOpenGeocoding, groupByContact, matchesView, parseDashboardParams, sortGroups, summarizeIntakes, type View } from "@/lib/dashboard";
import { fetchOpenIntakes, fetchSubmissions, fetchTeamMembers } from "@/lib/dashboard-data";
import { DASHBOARD_RESULTS, type DashboardResult } from "@/lib/dashboard-forms";

const RESULT_TONE = {
  ok: "border-green-300 bg-green-50 text-green-900",
  warn: "border-amber-300 bg-amber-50 text-amber-900",
  error: "border-red-300 bg-red-50 text-red-900",
} as const;

type SearchParams = Promise<{
  view?: string | string[];
  sort?: string | string[];
  dir?: string | string[];
  result?: string | string[];
  open?: string | string[];
}>;
type SessionClient = Awaited<ReturnType<typeof requireSalesUser>>["supabase"];

/** Lädt alles für das Dashboard und fängt Fehler ab, damit die Seite eine Meldung statt eines Absturzes zeigt. */
async function loadDashboard(supabase: SessionClient) {
  try {
    const [submissions, members, intakes] = await Promise.all([
      fetchSubmissions(supabase),
      fetchTeamMembers(supabase),
      fetchOpenIntakes(supabase),
    ]);
    return { ok: true as const, submissions, members, intakes };
  } catch (error) {
    console.error("[admin] Dashboard-Daten konnten nicht geladen werden", error);
    return { ok: false as const };
  }
}

async function AdminContent({ searchParams }: { searchParams: SearchParams }) {
  const { supabase, email, userId } = await requireSalesUser();
  const params = await searchParams;
  const { view, sort } = parseDashboardParams(params);
  const message = typeof params.result === "string" && params.result in DASHBOARD_RESULTS ? DASHBOARD_RESULTS[params.result as DashboardResult] : null;
  const openContactId = typeof params.open === "string" ? params.open : null;
  const data = await loadDashboard(supabase);

  const header = (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-zinc-600">Eingeloggt als {email}</p>
      {/* Normaler Link statt <Link>, damit der Browser die Datei herunterlädt. */}
      <a href="/admin/export" className="rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">
        CSV exportieren
      </a>
      <form action={logout}>
        <button type="submit" className="text-sm underline">
          Abmelden
        </button>
      </form>
    </div>
  );

  if (!data.ok) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <p className="text-red-700">Anfragen konnten nicht geladen werden. Bitte Seite neu laden.</p>
      </div>
    );
  }

  const me = data.members.find((m) => m.auth_user_id === userId)?.id ?? null;
  const groups = groupByContact(data.submissions, data.members);
  const counts = Object.fromEntries(VIEWS.map((v) => [v, groups.filter((g) => matchesView(g, v, me)).length])) as Record<View, number>;
  const visible = sortGroups(
    groups.filter((g) => matchesView(g, view, me)),
    sort,
  );

  return (
    <div className="flex flex-col gap-4">
      {header}
      {message && <p className={`rounded border px-3 py-2 text-sm ${RESULT_TONE[message.tone]}`}>{message.text}</p>}
      {me === null && (
        <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Dein Login ist noch keinem Team-Mitglied zugeordnet. „Meine“ bleibt leer, bis es in <code>team_members</code> eingetragen ist.
        </p>
      )}
      <IntakeNotices {...summarizeIntakes(data.intakes, new Date())} geocodeOpen={countOpenGeocoding(data.submissions, new Date())} />
      <DashboardTabs current={view} counts={counts} sort={sort} />
      <ContactList groups={visible} members={data.members} sort={sort} view={view} openContactId={openContactId} />
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
