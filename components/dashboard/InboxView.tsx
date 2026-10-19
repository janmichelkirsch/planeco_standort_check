import { ContactList } from "@/components/ContactList";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FeedbackProvider } from "@/components/dashboard/Feedback";
import { Greeting } from "@/components/dashboard/Greeting";
import { Notices } from "@/components/dashboard/Notices";
import { Tabs } from "@/components/dashboard/Tabs";
import { FeedbackLine, type Feedback } from "@/components/dashboard/ui";
import {
  VIEWS,
  countMyOpen,
  countOpenGeocoding,
  groupByContact,
  matchesView,
  sortGroups,
  summarizeIntakes,
  type IntakeRef,
  type Sort,
  type SubmissionRow,
  type TeamMember,
  type View,
} from "@/lib/dashboard";

export type InboxData = {
  now: Date;
  displayName: string;
  me: string | null;
  members: TeamMember[];
  submissions: SubmissionRow[];
  intakes: IntakeRef[];
  view: View;
  sort: Sort;
  message: Feedback | null;
  /** Gerade bearbeiteter Kontakt: bleibt sichtbar und aufgeklappt, auch wenn er nicht mehr zum Reiter passt. */
  keepContactId: string | null;
  openContactId: string | null;
};

/** Inhalt der Inbox ohne Laden: Begrüßung, Hinweise, Reiter, Kontaktliste. Die Seite lädt, die lokale Vorschau setzt Beispieldaten ein. */
export function InboxView({ now, displayName, me, members, submissions, intakes, view, sort, message, keepContactId, openContactId }: InboxData) {
  const groups = groupByContact(submissions, members);
  const counts = Object.fromEntries(VIEWS.map((v) => [v, groups.filter((g) => matchesView(g, v, me)).length])) as Record<View, number>;
  const visible = sortGroups(
    groups.filter((g) => matchesView(g, view, me) || g.contact.id === keepContactId),
    sort,
  );
  const { needsReview, unprocessed } = summarizeIntakes(intakes, now);

  return (
    <FeedbackProvider>
      {message && (
        <div className="mb-6">
          <FeedbackLine feedback={message} />
        </div>
      )}
      <div className="flex items-end justify-between gap-8">
        <Greeting
          now={now}
          name={displayName}
          unassigned={counts.unassigned}
          myOpen={countMyOpen(submissions, me)}
          hasData={groups.length > 0}
        />
        <Notices needsReview={needsReview} unprocessed={unprocessed} geocodeOpen={countOpenGeocoding(submissions, now)} />
      </div>
      <Tabs current={view} counts={counts} sort={sort} visible={visible.length} />
      <div className="mt-4">
        {visible.length === 0 ? (
          <EmptyState view={view} noData={groups.length === 0} unassigned={counts.unassigned} />
        ) : (
          <ContactList groups={visible} members={members} sort={sort} view={view} openContactId={openContactId} />
        )}
      </div>
    </FeedbackProvider>
  );
}
