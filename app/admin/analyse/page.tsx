import { Suspense } from "react";
import { Analyse } from "@/components/dashboard/analyse/Analyse";
import { berlinDay, toAnalyseRows } from "@/lib/analyse";
import { summarizeIntakes } from "@/lib/dashboard";
import { fetchOpenIntakes, fetchSubmissions } from "@/lib/dashboard-data";
import { getSalesContext } from "@/lib/sales-context";

/** Lädt alle Anfragen und gibt schlanke Zeilen (Tag, Kanal, Kampagne, Ergebnis …) an die Auswertung im Browser. */
async function AnalyseContent() {
  const { supabase } = await getSalesContext();
  let submissions, intakes;
  try {
    [submissions, intakes] = await Promise.all([fetchSubmissions(supabase), fetchOpenIntakes(supabase)]);
  } catch (error) {
    console.error("[admin/analyse] Daten konnten nicht geladen werden", error);
    return <p className="text-danger">Die Auswertung konnte nicht geladen werden. Bitte Seite neu laden.</p>;
  }
  const now = new Date();
  return <Analyse rows={toAnalyseRows(submissions)} today={berlinDay(now)} pendingReview={summarizeIntakes(intakes, now).needsReview} />;
}

export default function AnalysePage() {
  return (
    <Suspense fallback={<p className="text-sm text-forest-soft">Lade …</p>}>
      <AnalyseContent />
    </Suspense>
  );
}
