/**
 * Dashboard-Logik ohne Datenbank: Anfragen nach Kontakt bündeln, filtern, sortieren, Eingänge zusammenfassen.
 * Spezifikation v3, §8. Die Daten lädt `lib/dashboard-data.ts`.
 */

export type ConfirmationStatus = "pending" | "sent" | "failed";
export type SubmissionStatus = "open" | "contacted" | "completed";
export type Outcome = "qualified" | "not_qualified" | "unreachable";
export type MatchStatus = "auto_matched" | "manually_matched" | "new_contact_created";

export type TeamMember = { id: string; display_name: string };

export type ContactRef = {
  id: string;
  first_name: string;
  last_name: string;
  account_owner_id: string | null;
  created_at: string;
};

/** Eine Anfrage, wie `lib/dashboard-data.ts` sie mit Kontakt, Methoden und Mailstatus lädt. */
export type SubmissionRow = {
  id: string;
  intake_id: string;
  created_at: string;
  status: SubmissionStatus;
  completed_at: string | null;
  outcome: Outcome | null;
  match_status: MatchStatus;
  assigned_to_override: string | null;
  submitted_first_name: string;
  submitted_last_name: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  address_source: "photon" | "manual";
  municipality: string | null;
  county: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  geocode_status: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  fbclid: string | null;
  landing_page: string | null;
  referrer: string | null;
  email: { normalized_value: string };
  phone: { normalized_value: string };
  intake: { confirmation_status: ConfirmationStatus; confirmation_sent_at: string | null; confirmation_error: string | null };
  contact: ContactRef;
};

export type ContactGroup = {
  contact: ContactRef;
  owner: TeamMember | null;
  /** Neueste zuerst. */
  submissions: SubmissionRow[];
  total: number;
  completed: number;
  /** `open` + `contacted`: noch zu erledigen. */
  pending: number;
  latestAt: string;
  /** Abweichende Bearbeiter offener Anfragen („auch Björn“). */
  otherAssignees: TeamMember[];
  autoMatched: boolean;
};

export const isPending = (s: Pick<SubmissionRow, "status">) => s.status !== "completed";

/** Wer eine Anfrage tatsächlich bearbeitet: Override, sonst der Owner des Kontakts. */
export const effectiveAssignee = (s: Pick<SubmissionRow, "assigned_to_override" | "contact">) =>
  s.assigned_to_override ?? s.contact.account_owner_id;

export function groupByContact(rows: SubmissionRow[], members: TeamMember[]): ContactGroup[] {
  const memberById = new Map(members.map((m) => [m.id, m]));
  const byContact = new Map<string, SubmissionRow[]>();
  for (const row of rows) {
    const list = byContact.get(row.contact.id) ?? [];
    list.push(row);
    byContact.set(row.contact.id, list);
  }

  return [...byContact.values()].map((list) => {
    const submissions = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const contact = submissions[0].contact;
    const ownerId = contact.account_owner_id;
    const otherIds = new Set(
      submissions
        .filter((s) => isPending(s) && s.assigned_to_override && s.assigned_to_override !== ownerId)
        .map((s) => s.assigned_to_override as string),
    );
    const completed = submissions.filter((s) => s.status === "completed").length;
    return {
      contact,
      owner: ownerId ? (memberById.get(ownerId) ?? null) : null,
      submissions,
      total: submissions.length,
      completed,
      pending: submissions.length - completed,
      latestAt: submissions[0].created_at,
      otherAssignees: [...otherIds].map((id) => memberById.get(id)).filter((m): m is TeamMember => !!m),
      autoMatched: submissions.some((s) => s.match_status === "auto_matched"),
    };
  });
}

export const VIEWS = ["open", "unassigned", "mine", "all"] as const;
export type View = (typeof VIEWS)[number];

export const VIEW_LABEL: Record<View, string> = {
  open: "Offen",
  unassigned: "Nicht zugewiesen",
  mine: "Meine",
  all: "Alle",
};

/**
 * - open: noch etwas zu tun
 * - unassigned: noch etwas zu tun, niemand hat übernommen
 * - mine: eine offene Anfrage, die ich bearbeite (als Owner ohne Override oder per Override)
 * - all: alles, auch Abgeschlossenes
 */
export function matchesView(group: ContactGroup, view: View, me: string | null): boolean {
  switch (view) {
    case "open":
      return group.pending > 0;
    case "unassigned":
      return group.pending > 0 && group.owner === null;
    case "mine":
      return me !== null && group.submissions.some((s) => isPending(s) && effectiveAssignee(s) === me);
    case "all":
      return true;
  }
}

export const SORT_COLUMNS = ["latest", "name", "owner"] as const;
export type SortColumn = (typeof SORT_COLUMNS)[number];
export type SortDirection = "asc" | "desc";
export type Sort = { column: SortColumn; direction: SortDirection };

export const DEFAULT_SORT: Sort = { column: "latest", direction: "desc" };

const collator = new Intl.Collator("de");

/** Ohne Owner steht in beide Richtungen am Ende; gleiche Werte nach neuester Anfrage. */
export function sortGroups(groups: ContactGroup[], sort: Sort): ContactGroup[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  const byLatest = (a: ContactGroup, b: ContactGroup) => b.latestAt.localeCompare(a.latestAt);
  return [...groups].sort((a, b) => {
    if (sort.column === "latest") return factor * a.latestAt.localeCompare(b.latestAt);
    if (sort.column === "owner") {
      if (!a.owner || !b.owner) return a.owner === b.owner ? byLatest(a, b) : a.owner ? -1 : 1;
      return factor * collator.compare(a.owner.display_name, b.owner.display_name) || byLatest(a, b);
    }
    const name = (g: ContactGroup) => `${g.contact.last_name} ${g.contact.first_name}`;
    return factor * collator.compare(name(a), name(b)) || byLatest(a, b);
  });
}

type Params = { view?: string | string[]; sort?: string | string[]; dir?: string | string[] };

/** Ansicht und Sortierung aus der URL. Unbekannte Werte fallen auf den Standard zurück. */
export function parseDashboardParams(params: Params): { view: View; sort: Sort } {
  const view = VIEWS.find((v) => v === params.view) ?? "open";
  const column = SORT_COLUMNS.find((c) => c === params.sort) ?? DEFAULT_SORT.column;
  const direction: SortDirection =
    params.dir === "asc" || params.dir === "desc" ? params.dir : column === "latest" ? "desc" : "asc";
  return { view, sort: { column, direction } };
}

export type IntakeRef = { id: string; status: string; received_at: string };

/** Eingänge, um die sich jemand kümmern muss. „Nicht verarbeitet“ = fehlgeschlagen oder nach 5 Minuten noch nicht zugeordnet. */
export function summarizeIntakes(intakes: IntakeRef[], now: Date, staleAfterMs = 5 * 60_000) {
  const needsReview = intakes.filter((i) => i.status === "needs_review").length;
  const unprocessed = intakes.filter(
    (i) => i.status === "failed" || (i.status === "received" && now.getTime() - Date.parse(i.received_at) > staleAfterMs),
  ).length;
  return { needsReview, unprocessed };
}

/** Adressen, die noch nachgeschlagen werden müssen: Photon war nicht erreichbar, oder nach 5 Minuten noch offen. */
export function countOpenGeocoding(
  submissions: Pick<SubmissionRow, "geocode_status" | "created_at">[],
  now: Date,
  staleAfterMs = 5 * 60_000,
): number {
  return submissions.filter(
    (s) => s.geocode_status === "failed" || (s.geocode_status === "pending" && now.getTime() - Date.parse(s.created_at) > staleAfterMs),
  ).length;
}
