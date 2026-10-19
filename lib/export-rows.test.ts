import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";
import type { SubmissionRow } from "@/lib/dashboard";
import { EXPORT_COLUMNS, intakeToRow, submissionToRow } from "@/lib/export-rows";

const col = (row: string[], name: (typeof EXPORT_COLUMNS)[number]) => row[EXPORT_COLUMNS.indexOf(name)];

const submission = {
  id: "s1",
  intake_id: "i1",
  created_at: "2026-10-17T20:25:36Z",
  status: "contacted",
  completed_at: null,
  outcome: "qualified",
  match_status: "auto_matched",
  assigned_to_override: "bjoern",
  submitted_first_name: "Tom",
  submitted_last_name: "Ahrens",
  street: "Am Mühlenteich",
  house_number: "7",
  postal_code: "23627",
  city: "Groß Grönau",
  address_source: "photon",
  municipality: "Groß Grönau",
  county: "Kreis Herzogtum Lauenburg",
  state: "Schleswig-Holstein",
  latitude: 53.8,
  longitude: 10.7,
  geocode_status: "suggestion",
  utm_source: "meta",
  utm_medium: "paid_social",
  utm_campaign: "sommer",
  utm_content: null,
  utm_term: null,
  gclid: null,
  fbclid: "abc",
  landing_page: "/?utm_source=meta",
  referrer: null,
  email: { normalized_value: "tom@example.com" },
  phone: { normalized_value: "+4940123456" },
  intake: { confirmation_status: "sent", confirmation_sent_at: "2026-10-17T20:25:40Z", confirmation_error: null },
  contact: { id: "c1", first_name: "Thomas", last_name: "Ahrens", account_owner_id: "emily", created_at: "2026-10-01T08:00:00Z" },
} satisfies SubmissionRow;

const members = [
  { id: "emily", display_name: "Emily" },
  { id: "bjoern", display_name: "Björn" },
];

describe("submissionToRow", () => {
  const row = submissionToRow(submission, members);

  it("hat für jede Spalte einen Wert", () => {
    expect(row).toHaveLength(EXPORT_COLUMNS.length);
  });

  it("enthält Kontakt, eingegebenen Namen, Zuständige und Kampagne", () => {
    expect(col(row, "Kontaktname")).toBe("Thomas Ahrens");
    expect(col(row, "Name wie eingegeben")).toBe("Tom Ahrens");
    expect(col(row, "Zuständig (Kontakt)")).toBe("Emily");
    expect(col(row, "Bearbeiter (Anfrage)")).toBe("Björn");
    expect(col(row, "utm_campaign")).toBe("sommer");
    expect(col(row, "Status")).toBe("kontaktiert");
    expect(col(row, "Ergebnis")).toBe("qualifiziert");
    expect(col(row, "Einzugsgebiet")).toBe("im Einzugsgebiet");
    expect(col(row, "Eingang (deutsche Zeit)")).toBe("17.10.26, 22:25");
  });
});

describe("intakeToRow", () => {
  const row = intakeToRow({
    id: "i9",
    status: "needs_review",
    received_at: "2026-10-17T20:26:13Z",
    payload: { firstName: "Anna", lastName: "Zwei", street: "Lindenweg", houseNumber: "3", postalCode: "31535", city: "Neustadt", addressSource: "manual", state: null, utmSource: "test" },
    normalized_email: "anna@example.com",
    normalized_phone: "+491701112233",
    confirmation_status: "sent",
    confirmation_sent_at: null,
    confirmation_error: null,
  });

  it("markiert Prüffälle und lässt Kontaktspalten leer", () => {
    expect(col(row, "Verarbeitung")).toBe("in Prüfung");
    expect(col(row, "Kontakt-ID")).toBe("");
    expect(col(row, "Name wie eingegeben")).toBe("Anna Zwei");
    expect(col(row, "Adressquelle")).toBe("Manuell");
    expect(col(row, "Einzugsgebiet")).toBe("Gebiet unbekannt");
    expect(col(row, "utm_source")).toBe("test");
  });
});

describe("toCsv", () => {
  it("schützt vor Formeln, setzt Anführungszeichen und beginnt mit BOM", () => {
    const csv = toCsv(["A", "B"], [["+4940123456", 'Say "hi"; ok'], ["=HYPERLINK(1)", "Klöpper"]]);
    expect(csv.startsWith("﻿A;B\r\n")).toBe(true);
    expect(csv).toContain(`'+4940123456;"Say ""hi""; ok"`);
    expect(csv).toContain("'=HYPERLINK(1);Klöpper");
  });
});
