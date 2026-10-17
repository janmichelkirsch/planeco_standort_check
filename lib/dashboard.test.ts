import { describe, expect, it } from "vitest";
import {
  countOpenGeocoding,
  groupByContact,
  matchesView,
  parseDashboardParams,
  sortGroups,
  summarizeIntakes,
  type ContactRef,
  type SubmissionRow,
  type TeamMember,
} from "@/lib/dashboard";
import { serviceAreaStatus } from "@/lib/service-area";

const EMILY: TeamMember = { id: "emily", display_name: "Emily" };
const BJOERN: TeamMember = { id: "bjoern", display_name: "Björn" };
const MEMBERS = [EMILY, BJOERN];

const contact = (id: string, last: string, owner: string | null = null): ContactRef => ({
  id,
  first_name: "Test",
  last_name: last,
  account_owner_id: owner,
  created_at: "2026-10-01T08:00:00Z",
});

let seq = 0;
const sub = (c: ContactRef, overrides: Partial<SubmissionRow> = {}): SubmissionRow => ({
  id: `s${++seq}`,
  intake_id: `i${seq}`,
  created_at: `2026-10-0${(seq % 9) + 1}T08:00:00Z`,
  status: "open",
  completed_at: null,
  outcome: null,
  match_status: "new_contact_created",
  assigned_to_override: null,
  submitted_first_name: "Test",
  submitted_last_name: c.last_name,
  street: "Hauptstraße",
  house_number: "14",
  postal_code: "01067",
  city: "Dresden",
  address_source: "photon",
  municipality: "Dresden",
  county: "Dresden",
  state: "Sachsen",
  latitude: 51,
  longitude: 13,
  geocode_status: "suggestion",
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  gclid: null,
  fbclid: null,
  landing_page: null,
  referrer: null,
  email: { normalized_value: "test@example.com" },
  phone: { normalized_value: "+4940123456" },
  intake: { confirmation_status: "sent", confirmation_sent_at: null, confirmation_error: null },
  contact: c,
  ...overrides,
});

describe("groupByContact", () => {
  // Spezifikation §4: Thomas, Owner Max (hier Emily), eine Anfrage mit Override Lisa (hier Björn)
  const thomas = contact("thomas", "Ahrens", EMILY.id);
  const rows = [
    sub(thomas, { status: "completed", created_at: "2026-10-01T08:00:00Z" }),
    sub(thomas, { status: "contacted", assigned_to_override: BJOERN.id, created_at: "2026-10-03T08:00:00Z" }),
    sub(thomas, { status: "open", match_status: "auto_matched", created_at: "2026-10-02T08:00:00Z" }),
  ];
  const [group] = groupByContact(rows, MEMBERS);

  it("bündelt Anfragen einer Person, neueste zuerst", () => {
    expect(group.submissions.map((s) => s.created_at.slice(0, 10))).toEqual(["2026-10-03", "2026-10-02", "2026-10-01"]);
    expect(group.latestAt).toBe("2026-10-03T08:00:00Z");
  });

  it("zählt den Fortschritt: contacted ist nicht abgeschlossen (1/3)", () => {
    expect({ completed: group.completed, total: group.total, pending: group.pending }).toEqual({ completed: 1, total: 3, pending: 2 });
  });

  it("zeigt Owner und abweichende Bearbeiter („auch Björn“) und den Auto-Match-Hinweis", () => {
    expect(group.owner).toEqual(EMILY);
    expect(group.otherAssignees).toEqual([BJOERN]);
    expect(group.autoMatched).toBe(true);
  });

  it("nennt keinen Override einer abgeschlossenen Anfrage", () => {
    const [g] = groupByContact([sub(thomas, { status: "completed", assigned_to_override: BJOERN.id })], MEMBERS);
    expect(g.otherAssignees).toEqual([]);
  });
});

describe("matchesView", () => {
  const unassigned = groupByContact([sub(contact("a", "Neu"))], MEMBERS)[0];
  const emilys = groupByContact([sub(contact("b", "Emilys", EMILY.id))], MEMBERS)[0];
  const done = groupByContact([sub(contact("c", "Fertig", EMILY.id), { status: "completed" })], MEMBERS)[0];
  const overridden = groupByContact(
    [sub(contact("d", "Override", EMILY.id), { assigned_to_override: BJOERN.id })],
    MEMBERS,
  )[0];

  it("Offen: alles mit offener Arbeit, egal wer zuständig ist", () => {
    expect([unassigned, emilys, done, overridden].map((g) => matchesView(g, "open", EMILY.id))).toEqual([true, true, false, true]);
  });

  it("Nicht zugewiesen: nur ohne Owner", () => {
    expect([unassigned, emilys, overridden].map((g) => matchesView(g, "unassigned", null))).toEqual([true, false, false]);
  });

  it("Meine: als Owner ohne Override oder per Override, nicht wenn alles an jemand anderen übergeben ist", () => {
    expect([unassigned, emilys, done, overridden].map((g) => matchesView(g, "mine", EMILY.id))).toEqual([false, true, false, false]);
    expect(matchesView(overridden, "mine", BJOERN.id)).toBe(true);
  });

  it("Alle: auch Abgeschlossenes", () => {
    expect(matchesView(done, "all", null)).toBe(true);
  });

  it("3/3 abgeschlossen + neue offene Anfrage = 3/4 und wieder offen", () => {
    const c = contact("e", "Wieder", EMILY.id);
    const rows = [sub(c, { status: "completed" }), sub(c, { status: "completed" }), sub(c, { status: "completed" })];
    expect(matchesView(groupByContact(rows, MEMBERS)[0], "open", null)).toBe(false);
    const again = groupByContact([...rows, sub(c)], MEMBERS)[0];
    expect([again.completed, again.total, matchesView(again, "open", null)]).toEqual([3, 4, true]);
    expect(again.owner).toEqual(EMILY);
  });
});

describe("sortGroups", () => {
  const groups = groupByContact(
    [
      sub(contact("1", "Zander", BJOERN.id), { created_at: "2026-10-01T08:00:00Z" }),
      sub(contact("2", "Ahrens"), { created_at: "2026-10-03T08:00:00Z" }),
      sub(contact("3", "Müller", EMILY.id), { created_at: "2026-10-02T08:00:00Z" }),
    ],
    MEMBERS,
  );
  const names = (gs: typeof groups) => gs.map((g) => g.contact.last_name);

  it("neueste Anfrage zuerst (Standard)", () => {
    expect(names(sortGroups(groups, { column: "latest", direction: "desc" }))).toEqual(["Ahrens", "Müller", "Zander"]);
  });

  it("nach Name, deutsche Sortierung", () => {
    expect(names(sortGroups(groups, { column: "name", direction: "asc" }))).toEqual(["Ahrens", "Müller", "Zander"]);
  });

  it("nach Zuständigem, ohne Owner immer am Ende", () => {
    expect(names(sortGroups(groups, { column: "owner", direction: "asc" }))).toEqual(["Zander", "Müller", "Ahrens"]);
    expect(names(sortGroups(groups, { column: "owner", direction: "desc" }))).toEqual(["Müller", "Zander", "Ahrens"]);
  });
});

describe("parseDashboardParams", () => {
  it("Standard: Offen, neueste zuerst", () => {
    expect(parseDashboardParams({})).toEqual({ view: "open", sort: { column: "latest", direction: "desc" } });
  });

  it("ignoriert unbekannte Werte aus der URL", () => {
    expect(parseDashboardParams({ view: "x", sort: "drop table", dir: "up" })).toEqual({
      view: "open",
      sort: { column: "latest", direction: "desc" },
    });
  });

  it("Name sortiert standardmäßig aufsteigend", () => {
    expect(parseDashboardParams({ view: "mine", sort: "name" })).toEqual({ view: "mine", sort: { column: "name", direction: "asc" } });
  });
});

describe("summarizeIntakes", () => {
  const now = new Date("2026-10-17T10:00:00Z");
  it("zählt Prüffälle und hängende Eingänge (fehlgeschlagen oder älter als 5 Minuten)", () => {
    expect(
      summarizeIntakes(
        [
          { id: "1", status: "needs_review", received_at: "2026-10-17T09:00:00Z" },
          { id: "2", status: "failed", received_at: "2026-10-17T09:59:00Z" },
          { id: "3", status: "received", received_at: "2026-10-17T09:50:00Z" },
          { id: "4", status: "received", received_at: "2026-10-17T09:58:00Z" },
          { id: "5", status: "processed", received_at: "2026-10-17T08:00:00Z" },
        ],
        now,
      ),
    ).toEqual({ needsReview: 1, unprocessed: 2 });
  });
});

describe("countOpenGeocoding", () => {
  it("zählt fehlgeschlagene und hängende Adressen, nicht frische oder erledigte", () => {
    const now = new Date("2026-10-17T10:00:00Z");
    expect(
      countOpenGeocoding(
        [
          { geocode_status: "failed", created_at: "2026-10-17T09:59:00Z" },
          { geocode_status: "pending", created_at: "2026-10-17T09:50:00Z" },
          { geocode_status: "pending", created_at: "2026-10-17T09:59:00Z" },
          { geocode_status: "geocoded", created_at: "2026-10-17T08:00:00Z" },
          { geocode_status: "not_found", created_at: "2026-10-17T08:00:00Z" },
        ],
        now,
      ),
    ).toBe(2);
  });
});

describe("serviceAreaStatus", () => {
  it("alle Bundesländer gehören dazu, ohne Bundesland ist es unbekannt", () => {
    expect(serviceAreaStatus("Nordrhein-Westfalen")).toBe("inside");
    expect(serviceAreaStatus(null)).toBe("unknown");
  });

  it("lässt sich einschränken", () => {
    expect(serviceAreaStatus("Bayern", ["Hamburg", "Schleswig-Holstein"])).toBe("outside");
  });
});
