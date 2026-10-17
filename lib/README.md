# lib/

Logik und Anbindung externer Dienste, ohne UI.

- `lead-schema.ts` – zod-Schema einer Anfrage mit deutschen Fehlermeldungen, gemeinsam für Formular und Server. `toFieldErrors` liefert die erste Meldung pro Feld.
  Enthält Vorwahl-Land, `clientRequestId` (noch optional), Kreis/Gemeinde und die Tracking-Felder (`TRACKING_FIELDS`; zu lang → gekürzt, nie ein Ablehnungsgrund).
- `phone-input.ts` – Logik des Telefonfelds: Länderliste, Formatierung beim Tippen (`AsYouType`), Erkennen von `+…`/`00…`, Löschen über Leerzeichen hinweg, Cursor-Position.
- `tracking.ts` – Kampagnen-Herkunft (UTM, `gclid`, `fbclid`, Landingpage, Referrer) beim Laden lesen und in `sessionStorage` merken; neuer Kampagnen-Klick ersetzt die gemerkte.
- `normalize.ts` – Telefon → E.164 (`libphonenumber-js`, Standardland DE) und E-Mail → getrimmt/kleingeschrieben. Grundlage fürs Matching.
- `*.test.ts` – Unit-Tests (Vitest), Aufruf `npm test`.
- `use-lead-form.ts` – gemeinsamer Formular-Zustand für Mobile und Desktop: Adresssuche/-felder, Telefon (`updatePhone`), Prüfung pro Schritt, Fokus auf den ersten Fehler, Absenden an `/api/lead` mit Tracking und `clientRequestId` (gleiche ID bei unverändertem erneutem Versuch).
- `photon.ts` – Adresssuche über Photon (kostenlos, kein Key). Wandelt Treffer in unsere Adressfelder um (nur DE, nur Häuser und Straßen), inkl. Kreis (`county`) und Gemeinde (`municipality`).
- `mail/` – Mailversand (Brevo, Vorlagen), siehe `mail/README.md`.
- `supabase/` – Supabase-Clients, getrennt nach Zweck (siehe `supabase/README.md`).
- `auth.ts` – `requireSalesUser()`: prüft den Login serverseitig und leitet sonst zu `/login` um.
- `leads.ts` – Lesen der Anfragen: `fetchLeadsPage` (eine Seite à 1000 Zeilen) und `fetchAllLeads` (alle, seitenweise). Enthält die erlaubten Sortierspalten.
- `format.ts` – Anzeige-Formate: Zeitstempel in deutscher Zeit (Europe/Berlin), Labels für die Adressquelle.
- `csv.ts` – CSV-Export: Semikolon, UTF-8 mit BOM (Umlaute in Excel), Schutz gegen Formel-Injection (`'` vor = + - @).
