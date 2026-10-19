import type { ReactNode } from "react";
import { ContactBar } from "@/components/dashboard/ContactBar";
import { ContactRow, type ContactRowData } from "@/components/dashboard/ContactRow";
import { SortHeader } from "@/components/dashboard/SortHeader";
import { CONTACT_COLS, cardClass } from "@/components/dashboard/ui";
import { hasIssue, type ContactGroup, type Sort, type SubmissionRow, type View } from "@/lib/dashboard";
import { formatBerlinDateTime } from "@/lib/format";
import { formatPhone } from "@/lib/phone-format";

type Props = {
  groups: ContactGroup[];
  sort: Sort;
  view: View;
  openContactId: string | null;
  /** Inhalt einer Anfrage im aufgeklappten Kontakt. */
  renderSubmission: (submission: SubmissionRow, group: ContactGroup) => ReactNode;
};

/**
 * Kontaktliste: Kopf mit Sortier-Links, eine Zeile pro Kontakt. Nur Desktop; unter 1024 px scrollt die Tabelle in sich.
 * Ansicht, Filter und Sortierung kommen fertig aus `lib/dashboard.ts`.
 */
export function ContactTable({ groups, sort, view, openContactId, renderSubmission }: Props) {
  return (
    <div className={`overflow-x-auto ${cardClass}`}>
      <div className="min-w-[64rem]">
        <div className={`${CONTACT_COLS} border-b border-line-soft px-6 py-2.5 text-xs font-medium text-forest-soft`}>
          <SortHeader label="Kontakt" column="name" current={sort} view={view} />
          <span>Erreichbar</span>
          <SortHeader label="Zuständig" column="owner" current={sort} view={view} />
          <span>Fortschritt</span>
          <SortHeader label="Neueste Anfrage" column="latest" current={sort} view={view} />
          <span />
        </div>
        <ul className="divide-y divide-line-soft">
          {groups.map((group) => (
            <li key={group.contact.id}>
              <ContactRow data={rowData(group)} initialOpen={group.contact.id === openContactId}>
                <ContactBar
                  contactId={group.contact.id}
                  ownerId={group.contact.account_owner_id}
                  firstName={group.contact.first_name}
                  lastName={group.contact.last_name}
                />
                {group.submissions.map((s) => (
                  <div key={s.id}>{renderSubmission(s, group)}</div>
                ))}
              </ContactRow>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function rowData(group: ContactGroup): ContactRowData {
  const newest = group.submissions[0];
  return {
    id: group.contact.id,
    name: `${group.contact.first_name} ${group.contact.last_name}`,
    ownerId: group.contact.account_owner_id,
    requestCount: group.total,
    autoMatched: group.autoMatched,
    issue: group.submissions.some(hasIssue),
    phone: { e164: newest.phone.normalized_value, display: formatPhone(newest.phone.normalized_value) },
    email: newest.email.normalized_value,
    alsoNames: group.otherAssignees.map((m) => m.display_name),
    statuses: [...group.submissions].reverse().map((s) => s.status),
    latestAt: formatBerlinDateTime(newest.created_at),
    latestCity: newest.city,
  };
}
