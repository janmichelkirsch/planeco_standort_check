import { Suspense } from "react";
import { InboxView } from "@/components/dashboard/InboxView";
import { parseDashboardParams } from "@/lib/dashboard";
import { fetchOpenIntakes, fetchSubmissions } from "@/lib/dashboard-data";
import { DASHBOARD_RESULTS, type DashboardResult } from "@/lib/dashboard-forms";
import { getSalesContext } from "@/lib/sales-context";

type SearchParams = Promise<{
  view?: string | string[];
  sort?: string | string[];
  dir?: string | string[];
  result?: string | string[];
  open?: string | string[];
}>;

async function AdminContent({ searchParams }: { searchParams: SearchParams }) {
  const { supabase, me, members, displayName } = await getSalesContext();
  const params = await searchParams;
  const { view, sort } = parseDashboardParams(params);
  const result = typeof params.result === "string" && params.result in DASHBOARD_RESULTS ? DASHBOARD_RESULTS[params.result as DashboardResult] : null;

  let submissions, intakes;
  try {
    [submissions, intakes] = await Promise.all([fetchSubmissions(supabase), fetchOpenIntakes(supabase)]);
  } catch (error) {
    console.error("[admin] Dashboard-Daten konnten nicht geladen werden", error);
    return <p className="text-danger">Anfragen konnten nicht geladen werden. Bitte Seite neu laden.</p>;
  }

  return (
    <InboxView
      now={new Date()}
      displayName={displayName}
      me={me}
      members={members}
      submissions={submissions}
      intakes={intakes}
      view={view}
      sort={sort}
      message={result && { tone: result.tone, text: result.text }}
      openContactId={typeof params.open === "string" ? params.open : null}
    />
  );
}

export default function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="text-sm text-forest-soft">Lade …</p>}>
      <AdminContent searchParams={searchParams} />
    </Suspense>
  );
}
