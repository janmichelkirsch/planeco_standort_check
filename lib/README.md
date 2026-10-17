# lib/

Logik und Anbindung externer Dienste, ohne UI.

- `lead-schema.ts` – zod-Schema einer Anfrage mit deutschen Fehlermeldungen, gemeinsam für Formular und Server. `toFieldErrors` liefert die erste Meldung pro Feld.
- `use-lead-form.ts` – gemeinsamer Formular-Zustand für Mobile und Desktop: Adresssuche/-felder, Prüfung pro Schritt, Fokus auf den ersten Fehler, Absenden an `/api/lead`.
- `photon.ts` – Adresssuche über Photon (kostenlos, kein Key). Wandelt Treffer in unsere Adressfelder um (nur DE, nur Häuser und Straßen).
- `mail/` – Mailversand (Brevo, Vorlagen), siehe `mail/README.md`.
- `supabase/` – Supabase-Clients, getrennt nach Zweck (siehe `supabase/README.md`).
- `auth.ts` – `requireSalesUser()`: prüft den Login serverseitig und leitet sonst zu `/login` um.
- `leads.ts` – Lesen der Anfragen: `fetchLeadsPage` (eine Seite à 1000 Zeilen) und `fetchAllLeads` (alle, seitenweise). Enthält die erlaubten Sortierspalten.
- `format.ts` – Anzeige-Formate: Zeitstempel in deutscher Zeit (Europe/Berlin), Labels für die Adressquelle.
- `csv.ts` – CSV-Export: Semikolon, UTF-8 mit BOM (Umlaute in Excel), Schutz gegen Formel-Injection (`'` vor = + - @).
