# supabase/

SQL-Dateien für die Datenbank, nummeriert in Ausführungsreihenfolge.
Ausführen: Supabase-Dashboard → SQL Editor → Inhalt einfügen → Run.

- `001`–`003` gehören zum Speed-MVP (Tabelle `leads`). Seit `004` liest und schreibt der Code `leads` nicht mehr; `005` hat sie am 19.10.2026 gelöscht.
  Alle Dateien bis `005` sind in Supabase ausgeführt. Für ein neues Projekt: `001`–`005` der Reihe nach (oder `001`–`003` überspringen und `005` weglassen; `004` braucht `leads` nicht).
- `001_leads.sql` – Tabelle `leads` (Speed-MVP, flach). RLS aktiv ohne Policies: nur der Server mit Secret Key schreibt und liest.
  Enthält ein `grant` für `service_role`, weil „Automatically expose new tables“ im Projekt aus ist.
- `002_dashboard_read.sql` – Leserecht für eingeloggte Nutzer (`authenticated`) per RLS-Policy. Voraussetzung: Selbstregistrierung ist aus.
- `003_confirmation_mail.sql` – Spalten für den Versandstatus der Bestätigungsmail (`pending` / `sent` / `failed`, Zeitpunkt, Fehlergrund).
- `004_contact_model.sql` – Datenmodell Kontakt ↔ Anfrage (Spezifikation: `docs/spezifikation_v3.md`). Additiv geschrieben (lief neben `leads`).
  Fünf Tabellen, Trigger (Methoden-Typ, unveränderliche Methoden, `updated_at`), Matching als Funktion `process_intake`
  (nur `service_role`), Dashboard-Funktionen mit Team-Member-Prüfung (`claim_contact`, `resolve_intake_review`, `set_*` …),
  RLS: eingeloggte Nutzer lesen, schreiben nur über Funktionen.
  **Vor dem Ausführen** im letzten Block die drei Login-E-Mails (Emily, Björn, Michel) eintragen; die Abfrage am Ende muss drei Zeilen zeigen.
- `005_drop_leads.sql` – löscht `leads` (ausgeführt 19.10.2026 nach Merge und Live-Test).
- `tests/` – lokale Tests für `004` (siehe `tests/README.md`).
