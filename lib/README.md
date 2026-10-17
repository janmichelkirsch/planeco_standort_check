# lib/

Logik und Anbindung externer Dienste, ohne UI.

- `lead-schema.ts` – zod-Schema einer Anfrage mit deutschen Fehlermeldungen, gemeinsam für Formular und Server. `toFieldErrors` liefert die erste Meldung pro Feld.
  Enthält Vorwahl-Land, `clientRequestId` (noch optional), Kreis/Gemeinde und die Tracking-Felder (`TRACKING_FIELDS`; zu lang → gekürzt, nie ein Ablehnungsgrund).
- `phone-input.ts` – Logik des Telefonfelds: Länderliste, Formatierung beim Tippen (`AsYouType`), Erkennen von `+…`/`00…`, Löschen über Leerzeichen hinweg, Cursor-Position.
- `tracking.ts` – Kampagnen-Herkunft (UTM, `gclid`, `fbclid`, Landingpage, Referrer) beim Laden lesen und in `sessionStorage` merken; neuer Kampagnen-Klick ersetzt die gemerkte.
- `intake-row.ts` – `toIntakeRow()`: baut aus einer geprüften Anfrage die Zeile für `incoming_submissions` (normalisierte Mail/Telefon, Request-ID, Payload).
- `intake.ts` – `storeIntake()` (idempotent über `client_request_id`) und `processIntake()` (ruft `process_intake`, bei Fehler `mark_intake_failed`; wirft nie). Nur serverseitig.
- `normalize.ts` – Telefon → E.164 (`libphonenumber-js`, Standardland DE) und E-Mail → getrimmt/kleingeschrieben. Grundlage fürs Matching.
- `*.test.ts` – Unit-Tests (Vitest), Aufruf `npm test`.
- `use-lead-form.ts` – gemeinsamer Formular-Zustand für Mobile und Desktop: Adresssuche/-felder, Telefon (`updatePhone`), Prüfung pro Schritt, Fokus auf den ersten Fehler, Absenden an `/api/lead` mit Tracking und `clientRequestId` (gleiche ID bei unverändertem erneutem Versuch).
- `photon.ts` – Adresssuche über Photon (kostenlos, kein Key). Wandelt Treffer in unsere Adressfelder um (nur DE, nur Häuser und Straßen), inkl. Kreis (`county`) und Gemeinde (`municipality`).
- `mail/` – Mailversand (Brevo, Vorlagen), siehe `mail/README.md`.
- `supabase/` – Supabase-Clients, getrennt nach Zweck (siehe `supabase/README.md`).
- `auth.ts` – `requireSalesUser()`: prüft den Login serverseitig und leitet sonst zu `/login` um. Liefert Client, E-Mail und Auth-ID.
- `dashboard.ts` – Dashboard-Logik ohne Datenbank: Anfragen nach Kontakt bündeln (Fortschritt, „auch …“, Auto-Match), Ansichten filtern, sortieren, URL-Parameter (Whitelist), Eingänge zusammenfassen.
- `dashboard-forms.ts` – Formulare des Dashboards prüfen (UUIDs, erlaubte Werte, nur geänderte Felder), Rücksprung-URL nur aus geprüften Werten, Rückmeldungen.
- `dashboard-data.ts` – Laden für Dashboard und Export über den Session-Client (RLS), seitenweise à 1000.
- `review.ts` – Prüfliste ohne Datenbank: Prüffall aus dem Eingang bauen, Verlauf je Kandidat, Formular der Entscheidung prüfen (UUIDs, Aktion, Namenswahl), Fehlercodes → Rückmeldung.
- `review-data.ts` – lädt Prüffälle und Kandidaten (`intake_candidates`) über den Session-Client.
- `service-area.ts` – Einzugsgebiet: Liste der Bundesländer (alle 16), Status wird nur berechnet, nie gespeichert.
- `export-rows.ts` – Spalten und Zeilen des CSV-Exports: eine Zeile pro Anfrage plus Eingänge in Prüfung / nicht verarbeitet.
- `phone-format.ts` – E.164 lesbar formatieren (`+49 170 5551234`).
- `format.ts` – Anzeige-Formate: Zeitstempel in deutscher Zeit (Europe/Berlin), Labels für Adressquelle, Mail, Status, Ergebnis, Zuordnung, Verarbeitung.
- `csv.ts` – CSV allgemein: Semikolon, UTF-8 mit BOM (Umlaute in Excel), Schutz gegen Formel-Injection (`'` vor = + - @).
