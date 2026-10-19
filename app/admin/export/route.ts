import { toCsv } from "@/lib/csv";
import { fetchSubmissions, fetchTeamMembers, fetchUnresolvedIntakes } from "@/lib/dashboard-data";
import { EXPORT_COLUMNS, intakeToRow, submissionToRow } from "@/lib/export-rows";
import { getSupabaseSession } from "@/lib/supabase/session";

/**
 * GET /admin/export – alle Anfragen als CSV, neueste zuerst. Nur mit Login.
 * Enthält auch Eingänge in Prüfung oder ohne Verarbeitung (Spalte „Verarbeitung“), damit keine Anfrage fehlt.
 */
export async function GET() {
  const supabase = await getSupabaseSession();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims) {
    return new Response("Nicht angemeldet", { status: 401 });
  }

  try {
    const [submissions, members, intakes] = await Promise.all([
      fetchSubmissions(supabase),
      fetchTeamMembers(supabase),
      fetchUnresolvedIntakes(supabase),
    ]);
    const rows = [
      ...submissions.map((s) => ({ at: s.created_at, row: submissionToRow(s, members) })),
      ...intakes.map((i) => ({ at: i.received_at, row: intakeToRow(i) })),
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .map((r) => r.row);

    const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
    return new Response(toCsv(EXPORT_COLUMNS, rows), {
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
