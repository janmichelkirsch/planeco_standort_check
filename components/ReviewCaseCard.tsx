import type { ReactNode } from "react";
import { resolveReview } from "@/app/admin/review/actions";
import { formatBerlinDateTime } from "@/lib/format";
import { formatPhone } from "@/lib/phone-format";
import type { ReviewCase } from "@/lib/review";

/**
 * Ein Prüffall: Eingabe oben, darunter die möglichen Kontakte mit Begründung (Mail/Telefon/Name gleich oder anders)
 * und den Knöpfen „Diesem Kontakt zuordnen“ bzw. „Neuen Kontakt anlegen“. Formulare ohne JavaScript (Server Action).
 */
export function ReviewCaseCard({ review }: { review: ReviewCase }) {
  const entered = `${review.firstName} ${review.lastName}`;
  return (
    <article className="rounded border border-zinc-300 bg-white">
      <header className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Eingang {formatBerlinDateTime(review.receivedAt)}</p>
        <p className="text-lg font-semibold">{entered}</p>
        <p className="text-sm text-zinc-700">
          {formatPhone(review.phone)} · {review.email}
        </p>
        <p className="text-sm text-zinc-700">
          {review.address}
          {review.campaign && <span className="text-zinc-500"> · Kampagne {review.campaign}</span>}
        </p>
      </header>

      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm font-semibold">Ist das eine dieser bekannten Personen?</p>
        {review.candidates.length === 0 && (
          <p className="text-sm text-zinc-600">Keine passenden Kontakte mehr gefunden (Daten haben sich seit dem Eingang geändert).</p>
        )}
        {review.candidates.map((c) => {
          const known = `${c.first_name} ${c.last_name}`;
          return (
            <form key={c.contact_id} action={resolveReview} className="rounded border border-zinc-200 p-3 text-sm">
              <input type="hidden" name="intakeId" value={review.id} />
              <input type="hidden" name="action" value="attach_existing" />
              <input type="hidden" name="contactId" value={c.contact_id} />
              <input type="hidden" name="firstName" value={review.firstName} />
              <input type="hidden" name="lastName" value={review.lastName} />

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{known}</span>
                <Reason match={c.phone_match}>Telefon</Reason>
                <Reason match={c.email_match}>Mail</Reason>
                <Reason match={c.name_match}>Name</Reason>
              </div>
              <p className="mt-1 text-zinc-600">
                Zuständig: {c.owner_name ?? "nicht zugewiesen"}
                {c.history &&
                  ` · ${c.history.count} ${c.history.count === 1 ? "Anfrage" : "Anfragen"}, zuletzt ${formatBerlinDateTime(c.history.latestAt)}: ${c.history.latestAddress}`}
              </p>

              {!c.name_match && (
                <fieldset className="mt-2 flex flex-col gap-1">
                  <legend className="sr-only">Kontaktname nach dem Zuordnen</legend>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="name" value="keep" defaultChecked />
                    <span>
                      Name <strong>{known}</strong> behalten
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="name" value="take" />
                    <span>
                      Name auf <strong>{entered}</strong> ändern
                    </span>
                  </label>
                </fieldset>
              )}

              <button type="submit" className="mt-3 rounded bg-zinc-900 px-3 py-1.5 font-semibold text-white">
                Diesem Kontakt zuordnen
              </button>
            </form>
          );
        })}

        <form action={resolveReview} className="flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-3 text-sm">
          <input type="hidden" name="intakeId" value={review.id} />
          <input type="hidden" name="action" value="create_new" />
          <span className="text-zinc-700">Andere Person (z. B. gemeinsame Familiennummer)?</span>
          <button type="submit" className="rounded border border-zinc-900 px-3 py-1.5 font-semibold">
            Neuen Kontakt „{entered}“ anlegen
          </button>
        </form>
      </div>
    </article>
  );
}

function Reason({ match, children }: { match: boolean; children: ReactNode }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${match ? "bg-green-100 text-green-900" : "bg-zinc-100 text-zinc-700"}`}>
      {children} {match ? "gleich" : "anders"}
    </span>
  );
}
