import { reprocessIntakes } from "@/app/admin/actions";

/**
 * Hinweise auf Eingänge, die noch keine Anfrage im Dashboard sind. Erscheinen nur, wenn es etwas zu tun gibt,
 * damit keine Anfrage unbemerkt liegen bleibt (Spezifikation v3, §6.3).
 */
export function IntakeNotices({ needsReview, unprocessed }: { needsReview: number; unprocessed: number }) {
  if (needsReview === 0 && unprocessed === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {needsReview > 0 && (
        <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <strong>
            {needsReview} {needsReview === 1 ? "Anfrage wartet" : "Anfragen warten"} auf Prüfung.
          </strong>{" "}
          Unklar, ob die Person schon bekannt ist (z. B. gleiche Nummer, anderer Name). Die Prüfliste folgt; bis dahin stehen sie im CSV-Export.
        </p>
      )}
      {unprocessed > 0 && (
        <form action={reprocessIntakes} className="flex flex-wrap items-center gap-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          <span>
            <strong>
              {unprocessed} {unprocessed === 1 ? "Anfrage wurde" : "Anfragen wurden"} nicht verarbeitet.
            </strong>{" "}
            Sie sind gespeichert, aber noch keinem Kontakt zugeordnet.
          </span>
          <button type="submit" className="rounded bg-red-800 px-3 py-1.5 font-semibold text-white">
            Erneut verarbeiten
          </button>
        </form>
      )}
    </div>
  );
}
