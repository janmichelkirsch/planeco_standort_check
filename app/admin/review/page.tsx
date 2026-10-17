import Link from "next/link";
import { Suspense } from "react";
import { ReviewCaseCard } from "@/components/ReviewCaseCard";
import { requireSalesUser } from "@/lib/auth";
import { RESULT_MESSAGES, type ResultKey } from "@/lib/review";
import { fetchReviewCases } from "@/lib/review-data";

type SearchParams = Promise<{ result?: string | string[] }>;

const TONE = {
  ok: "border-green-300 bg-green-50 text-green-900",
  warn: "border-amber-300 bg-amber-50 text-amber-900",
  error: "border-red-300 bg-red-50 text-red-900",
} as const;

async function ReviewContent({ searchParams }: { searchParams: SearchParams }) {
  const { supabase } = await requireSalesUser();
  const { result } = await searchParams;
  const message = typeof result === "string" && result in RESULT_MESSAGES ? RESULT_MESSAGES[result as ResultKey] : null;

  let cases;
  try {
    cases = await fetchReviewCases(supabase);
  } catch (error) {
    console.error("[admin/review] Prüffälle konnten nicht geladen werden", error);
    return <p className="text-red-700">Prüffälle konnten nicht geladen werden. Bitte Seite neu laden.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {message && <p className={`rounded border px-3 py-2 text-sm ${TONE[message.tone]}`}>{message.text}</p>}
      {cases.length === 0 ? (
        <p className="text-zinc-600">Keine offenen Prüffälle.</p>
      ) : (
        <>
          <p className="text-sm text-zinc-600">
            Bei diesen Anfragen stimmen Mail oder Telefon mit einem bekannten Kontakt überein, aber nicht alles. Bitte entscheiden, ob es
            dieselbe Person ist. Der eingegebene Name bleibt an der Anfrage gespeichert.
          </p>
          {cases.map((review) => (
            <ReviewCaseCard key={review.id} review={review} />
          ))}
        </>
      )}
    </div>
  );
}

export default function ReviewPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <Link href="/admin" className="text-sm underline">
        ← Zurück zum Dashboard
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-bold">Zuordnung prüfen</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Lade …</p>}>
        <ReviewContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
