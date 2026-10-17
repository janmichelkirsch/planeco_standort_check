import { updateSubmission } from "@/app/admin/actions";
import { Badge, Item, ReturnFields, buttonClass, selectClass } from "@/components/DashboardParts";
import { MailStatus } from "@/components/MailStatus";
import { effectiveAssignee, type ContactRef, type Sort, type SubmissionRow, type TeamMember, type View } from "@/lib/dashboard";
import {
  ADDRESS_SOURCE_LABEL,
  GEOCODE_STATUS_LABEL,
  MATCH_STATUS_LABEL,
  OUTCOME_LABEL,
  SUBMISSION_STATUS_LABEL,
  formatBerlinDateTime,
} from "@/lib/format";
import { formatPhone } from "@/lib/phone-format";
import { SERVICE_AREA_LABEL, serviceAreaStatus } from "@/lib/service-area";

type Props = { submission: SubmissionRow; contact: ContactRef; members: TeamMember[]; view: View; sort: Sort };

/** Eine Anfrage: Grundstück, genutzte Kontaktdaten, Kampagne, Mailstatus und Bearbeitung (Status, Ergebnis, Bearbeiter). */
export function SubmissionCard({ submission: s, contact, members, view, sort }: Props) {
  const memberName = (id: string | null) => (id ? (members.find((m) => m.id === id)?.display_name ?? "unbekannt") : null);
  const assignee = memberName(effectiveAssignee(s));
  const owner = memberName(contact.account_owner_id);
  const area = serviceAreaStatus(s.state);
  const typedOtherName = s.submitted_first_name !== contact.first_name || s.submitted_last_name !== contact.last_name;
  // Gemeinde, Kreis, Bundesland ohne Wiederholung („Hamburg · Hamburg“ bei Stadtstaaten, „Dresden · Dresden“ bei kreisfreien Städten).
  const region = [...new Set([s.municipality, s.county, s.state].filter(Boolean))].join(" · ");

  return (
    <article className="rounded border border-zinc-200 bg-white p-3 text-sm">
      <header className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-semibold">{formatBerlinDateTime(s.created_at)}</span>
        <Badge tone={s.status === "completed" ? "green" : s.status === "contacted" ? "blue" : "amber"}>
          {SUBMISSION_STATUS_LABEL[s.status]}
        </Badge>
        {s.outcome && <Badge tone="zinc">{OUTCOME_LABEL[s.outcome]}</Badge>}
        <span className="text-zinc-600">
          Bearbeiter: {assignee ?? "noch niemand"}
          {s.assigned_to_override && " (abweichend vom Zuständigen)"}
        </span>
        <span className="text-zinc-500">· {MATCH_STATUS_LABEL[s.match_status]}</span>
      </header>

      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <Item label="Grundstück">
          {s.street} {s.house_number}, {s.postal_code} {s.city}
          <span className="block text-zinc-600">
            {region || GEOCODE_STATUS_LABEL[s.geocode_status] || "Gemeinde/Bundesland unbekannt"}
            {" · "}
            <span className={area === "inside" ? "text-green-700" : area === "outside" ? "text-red-700" : "text-zinc-500"}>
              {SERVICE_AREA_LABEL[area]}
            </span>
          </span>
          <span className="block text-zinc-500">
            {ADDRESS_SOURCE_LABEL[s.address_source]}
            {s.geocode_status === "geocoded" && " · nachgeschlagen"}
            {s.latitude !== null && s.longitude !== null && (
              <>
                {" · "}
                <a
                  href={`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=17/${s.latitude}/${s.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Karte
                </a>
              </>
            )}
          </span>
        </Item>
        <Item label="Kontakt (in dieser Anfrage)">
          <a href={`tel:${s.phone.normalized_value}`} className="block underline">
            {formatPhone(s.phone.normalized_value)}
          </a>
          <a href={`mailto:${s.email.normalized_value}`} className="block underline">
            {s.email.normalized_value}
          </a>
          {typedOtherName && (
            <span className="block text-zinc-500">
              eingegeben als „{s.submitted_first_name} {s.submitted_last_name}“
            </span>
          )}
        </Item>
        <Item label="Kampagne">
          <Campaign submission={s} />
        </Item>
        <Item label="Bestätigungsmail">
          <MailStatus intake={s.intake} />
        </Item>
      </dl>

      <form action={updateSubmission} className="mt-3 flex flex-wrap items-end gap-3 border-t border-zinc-100 pt-3">
        <ReturnFields view={view} sort={sort} />
        <input type="hidden" name="submissionId" value={s.id} />
        <input type="hidden" name="contactId" value={contact.id} />
        <input type="hidden" name="statusBefore" value={s.status} />
        <input type="hidden" name="outcomeBefore" value={s.outcome ?? ""} />
        <input type="hidden" name="overrideBefore" value={s.assigned_to_override ?? ""} />
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Status</span>
          <select name="status" defaultValue={s.status} className={selectClass}>
            {Object.entries(SUBMISSION_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Ergebnis</span>
          <select name="outcome" defaultValue={s.outcome ?? ""} className={selectClass}>
            <option value="">noch offen</option>
            {Object.entries(OUTCOME_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Bearbeiter</span>
          <select name="override" defaultValue={s.assigned_to_override ?? ""} className={selectClass}>
            <option value="">wie Zuständig{owner ? ` (${owner})` : " (noch niemand)"}</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonClass}>
          Speichern
        </button>
      </form>
    </article>
  );
}

function Campaign({ submission: s }: { submission: SubmissionRow }) {
  const source = [s.utm_source, s.utm_medium].filter(Boolean).join(" / ");
  const clicks = [s.gclid && "Google-Klick", s.fbclid && "Meta-Klick"].filter(Boolean).join(", ");
  if (!source && !s.utm_campaign && !clicks) {
    return (
      <span className="text-zinc-500">
        ohne Kampagne{s.referrer ? ` · über ${hostOf(s.referrer)}` : " · direkt"}
      </span>
    );
  }
  return (
    <>
      {source && <span className="block">{source}</span>}
      {s.utm_campaign && <span className="block">Kampagne: {s.utm_campaign}</span>}
      {(s.utm_content || s.utm_term) && (
        <span className="block text-zinc-600">{[s.utm_content, s.utm_term].filter(Boolean).join(" · ")}</span>
      )}
      {clicks && <span className="block text-zinc-600">{clicks}</span>}
    </>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
