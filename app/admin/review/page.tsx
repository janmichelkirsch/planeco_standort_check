import { Suspense } from "react";
import { ReviewView } from "@/components/dashboard/ReviewView";
import { RESULT_MESSAGES, type ResultKey } from "@/lib/review";
import { fetchReviewCases } from "@/lib/review-data";
import { getSalesContext } from "@/lib/sales-context";

type SearchParams = Promise<{ result?: string | string[] }>;

async function ReviewContent({ searchParams }: { searchParams: SearchParams }) {
  const { supabase } = await getSalesContext();
  const { result } = await searchParams;
  const message = typeof result === "string" && result in RESULT_MESSAGES ? RESULT_MESSAGES[result as ResultKey] : null;

  let cases;
  try {
    cases = await fetchReviewCases(supabase);
  } catch (error) {
    console.error("[admin/review] Prüffälle konnten nicht geladen werden", error);
    return <p className="text-danger">Prüffälle konnten nicht geladen werden. Bitte Seite neu laden.</p>;
  }
  return <ReviewView cases={cases} message={message && { tone: message.tone, text: message.text }} />;
}

export default function ReviewPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="text-sm text-forest-soft">Lade …</p>}>
      <ReviewContent searchParams={searchParams} />
    </Suspense>
  );
}
