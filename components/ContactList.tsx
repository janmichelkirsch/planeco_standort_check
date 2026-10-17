import type { ReactNode } from "react";
import { MailStatus } from "@/components/MailStatus";
import { SortableHeader } from "@/components/SortableHeader";
import { effectiveAssignee, type ContactGroup, type Sort, type SubmissionRow, type TeamMember, type View } from "@/lib/dashboard";
import {
  ADDRESS_SOURCE_LABEL,
  MATCH_STATUS_LABEL,
  OUTCOME_LABEL,
  SUBMISSION_STATUS_LABEL,
  formatBerlinDateTime,
} from "@/lib/format";
import { formatPhone } from "@/lib/phone-format";
import { SERVICE_AREA_LABEL, serviceAreaStatus } from "@/lib/service-area";

type Props = { groups: ContactGroup[]; members: TeamMember[]; sort: Sort; view: View };

const GRID = "sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-4";

/** Ein Eintrag pro Kontakt, Anfragen aufklappbar (Spezifikation v3, §8.2). Ohne JavaScript bedienbar (<details>). */
export function ContactList({ groups, members, sort, view }: Props) {
  if (groups.length === 0) {
    return <p className="text-zinc-600">Keine Kontakte in dieser Ansicht.</p>;
  }
  const memberName = new Map(members.map((m) => [m.id, m.display_name]));

  return (
    <div className="rounded border border-zinc-300">
      <div className={`hidden bg-zinc-100 px-3 py-2 text-sm font-semibold ${GRID}`}>
        <SortableHeader label="Kontakt" column="name" current={sort} view={view} />
        <SortableHeader label="Zuständig" column="owner" current={sort} view={view} />
        <span>Fortschritt</span>
        <SortableHeader label="Neueste Anfrage" column="latest" current={sort} view={view} />
      </div>
      <ul>
        {groups.map((group) => (
          <li key={group.contact.id} className="border-t border-zinc-200 first:border-t-0">
            <details className="group">
              <summary className={`cursor-pointer list-none px-3 py-3 text-sm hover:bg-zinc-50 ${GRID}`}>
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  <span aria-hidden="true" className="text-zinc-400 transition-transform group-open:rotate-90">
                    ▸
                  </span>
                  {group.contact.first_name} {group.contact.last_name}
                  {group.autoMatched && <Badge tone="blue">automatisch zugeordnet</Badge>}
                </span>
                <span className="block">
                  {group.owner ? group.owner.display_name : <Badge tone="amber">Nicht zugewiesen</Badge>}
                  {group.otherAssignees.length > 0 && (
                    <span className="text-zinc-500"> · auch {group.otherAssignees.map((m) => m.display_name).join(", ")}</span>
                  )}
                </span>
                <span className="block text-zinc-700">
                  {group.completed} von {group.total} abgeschlossen
                </span>
                <span className="block text-zinc-700">{formatBerlinDateTime(group.latestAt)}</span>
              </summary>
              <div className="flex flex-col gap-3 bg-zinc-50 px-3 pt-1 pb-4">
                {group.submissions.map((s) => (
                  <SubmissionCard key={s.id} submission={s} contact={group.contact} memberName={memberName} />
                ))}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubmissionCard({
  submission: s,
  contact,
  memberName,
}: {
  submission: SubmissionRow;
  contact: ContactGroup["contact"];
  memberName: Map<string, string>;
}) {
  const assignee = effectiveAssignee(s);
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
          Bearbeiter: {assignee ? (memberName.get(assignee) ?? "unbekannt") : "noch niemand"}
          {s.assigned_to_override && " (abweichend vom Zuständigen)"}
        </span>
        <span className="text-zinc-500">· {MATCH_STATUS_LABEL[s.match_status]}</span>
      </header>

      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <Item label="Grundstück">
          {s.street} {s.house_number}, {s.postal_code} {s.city}
          <span className="block text-zinc-600">
            {region || "Gemeinde/Bundesland noch unbekannt"}
            {" · "}
            <span className={area === "inside" ? "text-green-700" : area === "outside" ? "text-red-700" : "text-zinc-500"}>
              {SERVICE_AREA_LABEL[area]}
            </span>
          </span>
          <span className="block text-zinc-500">
            {ADDRESS_SOURCE_LABEL[s.address_source]}
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

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

const TONE = {
  amber: "bg-amber-100 text-amber-900",
  blue: "bg-sky-100 text-sky-900",
  green: "bg-green-100 text-green-900",
  zinc: "bg-zinc-100 text-zinc-800",
} as const;

function Badge({ tone, children }: { tone: keyof typeof TONE; children: ReactNode }) {
  return <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${TONE[tone]}`}>{children}</span>;
}
