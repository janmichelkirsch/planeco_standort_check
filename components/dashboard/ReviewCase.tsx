import type { ReactNode } from "react";
import { resolveReview } from "@/app/admin/review/actions";
import { Check, Mail, NotEqual, PhoneCall, Pin, UserPlus } from "@/components/icons";
import { buttonClass, cardClass, UnassignedPill } from "@/components/dashboard/ui";
import { originOf } from "@/lib/channel";
import { formatBerlinDateTime } from "@/lib/format";
import { formatPhone } from "@/lib/phone-format";
import type { ReviewCase as Case } from "@/lib/review";

type Candidate = Case["candidates"][number];

/**
 * Ein Prüffall (Spezifikation v3, §7.1): links die neue Eingabe, rechts die möglichen Kontakte mit Begründung,
 * bekannten Kontaktdaten, Verlauf und Zuständigem. Formulare mit Server Action (`resolveReview`), Rückmeldung per `?result=`.
 */
export function ReviewCase({ review, index, total }: { review: Case; index: number; total: number }) {
  const name = `${review.firstName} ${review.lastName}`;
  const origin = originOf(review.tracking);
  return (
    <article aria-label={`Prüffall ${name}`} className={`grid grid-cols-[22rem_minmax(0,1fr)] overflow-hidden ${cardClass}`}>
      <section className="border-r border-line-soft bg-sage/60 p-6">
        <p className="text-xs font-semibold tracking-wide text-forest-soft uppercase">
          Neue Eingabe · Fall {index} von {total}
        </p>
        <p className="mt-3 text-xl font-semibold tracking-tight">{name}</p>
        <p className="mt-0.5 text-[13px] text-forest-soft tabular-nums">Eingang {formatBerlinDateTime(review.receivedAt)}</p>

        <dl className="mt-5 space-y-3.5 text-sm">
          <InfoRow icon={<PhoneCall className="size-4" />} label="Telefon">
            <span className="tabular-nums">{formatPhone(review.phone)}</span>
          </InfoRow>
          <InfoRow icon={<Mail className="size-4" />} label="E-Mail">
            <span className="break-all">{review.email}</span>
          </InfoRow>
          <InfoRow icon={<Pin className="size-4" />} label="Grundstück">
            {review.address}
          </InfoRow>
        </dl>
        <p className="mt-5 border-t border-line-soft pt-4 text-[13px] text-forest-soft">
          Herkunft: {origin.fromCampaign ? `${origin.channel} · ${origin.campaign}` : origin.referrerHost ? `über ${origin.referrerHost}` : "direkt"}
        </p>
      </section>

      <section className="p-6">
        <h2 className="font-semibold">Ist das eine dieser bekannten Personen?</h2>
        <div className="mt-4 space-y-3">
          {review.candidates.length === 0 && (
            <p className="text-sm text-forest-soft">Keine passenden Kontakte mehr gefunden (die Daten haben sich seit dem Eingang geändert).</p>
          )}
          {review.candidates.map((c) => (
            <CandidateCard key={c.contact_id} review={review} candidate={c} />
          ))}
        </div>

        <form action={resolveReview} className="mt-4 flex items-center gap-4 rounded-xl border border-dashed border-line px-5 py-4">
          <input type="hidden" name="intakeId" value={review.id} />
          <input type="hidden" name="action" value="create_new" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Andere Person?</p>
            <p className="mt-0.5 text-[13px] text-forest-soft">
              Zum Beispiel eine gemeinsame Familiennummer. Es wird ein neuer Kontakt angelegt, danach noch nicht zugewiesen.
            </p>
          </div>
          <button type="submit" className={buttonClass()}>
            <UserPlus className="size-4" /> Neuen Kontakt „{name}“ anlegen
          </button>
        </form>
      </section>
    </article>
  );
}

function CandidateCard({ review, candidate: c }: { review: Case; candidate: Candidate }) {
  const known = `${c.first_name} ${c.last_name}`;
  const entered = `${review.firstName} ${review.lastName}`;
  return (
    <form action={resolveReview} className="rounded-xl ring-1 ring-line-soft">
      <input type="hidden" name="intakeId" value={review.id} />
      <input type="hidden" name="action" value="attach_existing" />
      <input type="hidden" name="contactId" value={c.contact_id} />
      <input type="hidden" name="firstName" value={review.firstName} />
      <input type="hidden" name="lastName" value={review.lastName} />

      <div className="flex items-start gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-[17px] font-semibold">{known}</p>
            <MatchChip same={c.phone_match} label="Telefon" />
            <MatchChip same={c.email_match} label="Mail" />
            <MatchChip same={c.name_match} label="Name" />
          </div>

          <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-forest-soft">Telefon</dt>
            <dd className={`tabular-nums ${c.phone_match ? "" : "font-medium text-warn"}`}>
              {c.methods.phones.map(formatPhone).join(", ") || "–"}
            </dd>
            <dt className="text-forest-soft">E-Mail</dt>
            <dd className={`truncate ${c.email_match ? "" : "font-medium text-warn"}`} title={c.methods.emails.join(", ")}>
              {c.methods.emails.join(", ") || "–"}
            </dd>
            <dt className="text-forest-soft">Verlauf</dt>
            <dd>
              {c.history
                ? `${c.history.count === 1 ? "1 Anfrage" : `${c.history.count} Anfragen`}, zuletzt ${formatBerlinDateTime(c.history.latestAt)}: ${c.history.latestAddress}`
                : "noch keine Anfrage"}
            </dd>
          </dl>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 text-sm">
          <span className="text-xs text-forest-soft">Zuständig</span>
          {c.owner_name ? <span className="font-medium">{c.owner_name}</span> : <UnassignedPill size="sm" />}
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-b-xl border-t border-line-soft bg-sage/40 px-5 py-3.5">
        {!c.name_match ? (
          <fieldset className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <legend className="sr-only">Welcher Name soll für den Kontakt gelten?</legend>
            <Radio value="keep" defaultChecked>
              Name behalten: <span className="font-semibold">{known}</span>
            </Radio>
            <Radio value="take">
              Name ändern in: <span className="font-semibold">{entered}</span>
            </Radio>
          </fieldset>
        ) : (
          <p className="flex-1 text-[13px] text-forest-soft">
            {c.owner_name ? `Die Anfrage landet danach bei ${c.owner_name} – wie alle Anfragen dieser Person.` : "Der Kontakt ist noch nicht zugewiesen."}
          </p>
        )}
        <button type="submit" className={buttonClass("primary", "sm")}>
          <Check className="size-4" /> Diesem Kontakt zuordnen
        </button>
      </div>
    </form>
  );
}

function MatchChip({ same, label }: { same: boolean; label: string }) {
  return same ? (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-ok-soft px-2.5 text-xs font-semibold text-ok">
      <Check className="size-3.5" /> {label} gleich
    </span>
  ) : (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-warn-soft px-2.5 text-xs font-semibold text-warn">
      <NotEqual className="size-3.5" /> {label} anders
    </span>
  );
}

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-forest-soft">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-forest-soft">{label}</dt>
        <dd className="mt-0.5">{children}</dd>
      </div>
    </div>
  );
}

function Radio({ value, defaultChecked, children }: { value: string; defaultChecked?: boolean; children: ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        name="name"
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 accent-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      />
      <span>{children}</span>
    </label>
  );
}
