import { ContactActions } from "@/components/ContactActions";
import { Badge } from "@/components/DashboardParts";
import { SortableHeader } from "@/components/SortableHeader";
import { SubmissionCard } from "@/components/SubmissionCard";
import type { ContactGroup, Sort, TeamMember, View } from "@/lib/dashboard";
import { formatBerlinDateTime } from "@/lib/format";

type Props = { groups: ContactGroup[]; members: TeamMember[]; sort: Sort; view: View; openContactId: string | null };

const GRID = "sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-4";

/**
 * Ein Eintrag pro Kontakt, Anfragen aufklappbar (Spezifikation v3, §8.2). Ohne JavaScript bedienbar (<details>).
 * Nach dem Speichern ist der bearbeitete Kontakt wieder aufgeklappt (`openContactId`).
 */
export function ContactList({ groups, members, sort, view, openContactId }: Props) {
  if (groups.length === 0) {
    return <p className="text-zinc-600">Keine Kontakte in dieser Ansicht.</p>;
  }

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
          <li key={group.contact.id} id={`kontakt-${group.contact.id}`} className="scroll-mt-4 border-t border-zinc-200 first:border-t-0">
            <details className="group" open={group.contact.id === openContactId}>
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
                <ContactActions group={group} members={members} view={view} sort={sort} />
                {group.submissions.map((s) => (
                  <SubmissionCard key={s.id} submission={s} contact={group.contact} members={members} view={view} sort={sort} />
                ))}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
