import { leadsToCsv } from "@/lib/csv";
import { fetchAllLeads, parseSort } from "@/lib/leads";
import { getSupabaseSession } from "@/lib/supabase/session";

/** GET /admin/export – alle Anfragen als CSV, in der gerade gewählten Sortierung. Nur mit Login. */
export async function GET(request: Request) {
  const supabase = await getSupabaseSession();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims) {
    return new Response("Nicht angemeldet", { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const sort = parseSort({ sort: params.get("sort") ?? undefined, dir: params.get("dir") ?? undefined });

  try {
    const leads = await fetchAllLeads(supabase, sort);
    const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
    return new Response(leadsToCsv(leads), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="standort-check-anfragen-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[admin/export] Export fehlgeschlagen", error);
    return new Response("Export fehlgeschlagen", { status: 500 });
  }
}
