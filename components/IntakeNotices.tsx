import Link from "next/link";
import { reprocessIntakes } from "@/app/admin/actions";

/**
 * Hinweise auf Eingänge, die noch keine Anfrage im Dashboard sind. Erscheinen nur, wenn es etwas zu tun gibt,
 * damit keine Anfrage unbemerkt liegen bleibt (Spezifikation v3, §6.3).
 */
export function IntakeNotices({ needsReview, unprocessed, geocodeOpen }: { needsReview: number; unprocessed: number; geocodeOpen: number }) {
  if (needsReview === 0 && unprocessed === 0 && geocodeOpen === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {needsReview > 0 && (
        <p className="flex flex-wrap items-center gap-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span>
            <strong>
              {needsReview} {needsReview === 1 ? "Anfrage wartet" : "Anfragen warten"} auf Prüfung.
            </strong>{" "}
            Unklar, ob die Person schon bekannt ist (z. B. gleiche Nummer, anderer Name).
          </span>
          <Link href="/admin/review" className="rounded bg-amber-800 px-3 py-1.5 font-semibold text-white">
            Jetzt prüfen
          </Link>
        </p>
      )}
      {(unprocessed > 0 || geocodeOpen > 0) && (
        <form action={reprocessIntakes} className="flex flex-wrap items-center gap-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          <span>
            {unprocessed > 0 && (
              <>
                <strong>
                  {unprocessed} {unprocessed === 1 ? "Anfrage wurde" : "Anfragen wurden"} nicht verarbeitet.
                </strong>{" "}
                Sie sind gespeichert, aber noch keinem Kontakt zugeordnet.{" "}
              </>
            )}
            {geocodeOpen > 0 && (
              <>
                <strong>
                  {geocodeOpen} {geocodeOpen === 1 ? "Adresse konnte" : "Adressen konnten"} noch nicht nachgeschlagen werden
                </strong>{" "}
                (Gemeinde/Bundesland fehlen).
              </>
            )}
          </span>
          <button type="submit" className="rounded bg-red-800 px-3 py-1.5 font-semibold text-white">
            Erneut verarbeiten
          </button>
        </form>
      )}
    </div>
  );
}
