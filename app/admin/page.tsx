import { Suspense } from "react";
import { InboxView } from "@/components/dashboard/InboxView";
import { parseDashboardParams, parseFocusParams } from "@/lib/dashboard";
import { fetchOpenIntakes, fetchSubmissions } from "@/lib/dashboard-data";
import { getSalesContext } from "@/lib/sales-context";

type SearchParams = Promise<{
  view?: string | string[];
  sort?: string | string[];
  dir?: string | string[];
  open?: string | string[];
  keep?: string | string[];
}>;

async function AdminContent({ searchParams }: { searchParams: SearchParams }) {
  const { supabase, me, members, displayName } = await getSalesContext();
  const params = await searchParams;
  const { view, sort } = parseDashboardParams(params);
  const { keep, open } = parseFocusParams(params);

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
      keepContactId={keep}
      openContactId={open}
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
