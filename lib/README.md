# lib/

Logik und Anbindung externer Dienste, ohne UI.

- `lead-schema.ts` – zod-Schema einer Anfrage mit deutschen Fehlermeldungen, gemeinsam für Formular und Server. `toFieldErrors` liefert die erste Meldung pro Feld.
  Enthält Vorwahl-Land, `clientRequestId` (noch optional), Kreis/Gemeinde und die Tracking-Felder (`TRACKING_FIELDS`; zu lang → gekürzt, nie ein Ablehnungsgrund).
- `phone-input.ts` – Logik des Telefonfelds: Länderliste, Formatierung beim Tippen (`AsYouType`), Erkennen von `+…`/`00…`, Löschen über Leerzeichen hinweg, Cursor-Position.
- `tracking.ts` – Kampagnen-Herkunft (UTM, `gclid`, `fbclid`, Landingpage, Referrer) beim Laden lesen und in `sessionStorage` merken; neuer Kampagnen-Klick ersetzt die gemerkte.
- `geocode-match.ts` – passender Photon-Treffer für eine manuelle Adresse: nur gleiche PLZ; gleiche Straße → mit Koordinaten, andere Straße → nur Ort; Felder fürs Update.
- `geocode.ts` – Nachschlagen manueller Adressen nach dem Anlegen der Anfrage (Timeout 5 s, Rückfall „PLZ Ort“, `failed` bei Photon-Ausfall). Nur serverseitig, wirft nie.
- `intake-row.ts` – `toIntakeRow()`: baut aus einer geprüften Anfrage die Zeile für `incoming_submissions` (normalisierte Mail/Telefon, Request-ID, Payload).
- `intake.ts` – `storeIntake()` (idempotent über `client_request_id`) und `processIntake()` (ruft `process_intake`, bei Fehler `mark_intake_failed`; wirft nie). Nur serverseitig.
- `normalize.ts` – Telefon → E.164 (`libphonenumber-js`, Standardland DE) und E-Mail → getrimmt/kleingeschrieben. Grundlage fürs Matching.
- `*.test.ts` – Unit-Tests (Vitest), Aufruf `npm test`.
- `use-lead-form.ts` – gemeinsamer Formular-Zustand für Mobile und Desktop: Adresssuche/-felder, Telefon (`updatePhone`), Prüfung pro Schritt, Fokus auf den ersten Fehler, Absenden an `/api/lead` mit Tracking und `clientRequestId` (gleiche ID bei unverändertem erneutem Versuch).
- `photon.ts` – Adresssuche über Photon (kostenlos, kein Key). Wandelt Treffer in unsere Adressfelder um (nur DE, nur Häuser und Straßen), inkl. Kreis (`county`) und Gemeinde (`municipality`).
  Ergänzt das Bundesland bei Stadtstaaten (Photon liefert für Hamburg/Berlin keins).
- `mail/` – Mailversand (Brevo, Vorlagen), siehe `mail/README.md`.
- `supabase/` – Supabase-Clients, getrennt nach Zweck (siehe `supabase/README.md`).
- `auth.ts` – `requireSalesUser()`: prüft den Login serverseitig und leitet sonst zu `/login` um. Liefert Client, E-Mail und Auth-ID.
- `sales-context.ts` – `getSalesContext()`: Login + Team-Mitglieder einmal pro Anfrage (React `cache`), geteilt von Layout und Seite; liefert `me`, Anzeigenamen und Position im Team.
- `dashboard.ts` – Dashboard-Logik ohne Datenbank: Anfragen nach Kontakt bündeln (Fortschritt, „auch …“, Auto-Match), Ansichten filtern, sortieren, URL-Parameter (Whitelist), Eingänge zusammenfassen,
  gemerkter Kontakt (`keep`/`open`, `inboxUrl`), Adress-Zustand (`plotState`: genau / nur Ort / nicht gefunden / ausstehend / fehlgeschlagen), Hinweis-Symbol (`hasIssue`).
- `dashboard-forms.ts` – Formulare des Dashboards prüfen (UUIDs, erlaubte Werte, nur geänderte Felder), Rücksprung-URL nur aus geprüften Werten, Rückmeldungen;
  Prüfungen für die Actions aus Client Components (`checkOwnerId`, `checkName`, `checkSubmissionPatch`) und `ActionResult`.
- `dashboard-data.ts` – Laden für Dashboard und Export über den Session-Client (RLS), seitenweise à 1000.
- `channel.ts` – Herkunft einer Anfrage: Kanal (UTM, sonst `gclid` → Google Ads, `fbclid` → Meta, sonst Verweis/Direkt), Kampagne („Kampagne unbekannt“ bei Klick ohne UTM), Klick-ID, Verweis-Host.
- `review.ts` – Prüfliste ohne Datenbank: Prüffall aus dem Eingang bauen, Verlauf je Kandidat, Formular der Entscheidung prüfen (UUIDs, Aktion, Namenswahl), Fehlercodes → Rückmeldung.
- `review-data.ts` – lädt Prüffälle und Kandidaten (`intake_candidates`) über den Session-Client.
- `service-area.ts` – Einzugsgebiet: Liste der Bundesländer (alle 16), Status wird nur berechnet, nie gespeichert.
- `export-rows.ts` – Spalten und Zeilen des CSV-Exports: eine Zeile pro Anfrage plus Eingänge in Prüfung / nicht verarbeitet.
- `phone-format.ts` – E.164 lesbar formatieren (`+49 170 5551234`).
- `format.ts` – Anzeige-Formate: Zeitstempel und ausgeschriebenes Datum in deutscher Zeit (Europe/Berlin), Gruß nach Uhrzeit, Labels für Adressquelle, Mail, Status, Ergebnis, Zuordnung, Verarbeitung.
- `csv.ts` – CSV allgemein: Semikolon, UTF-8 mit BOM (Umlaute in Excel), Schutz gegen Formel-Injection (`'` vor = + - @).
