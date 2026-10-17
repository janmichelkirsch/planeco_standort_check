# supabase/

SQL-Dateien für die Datenbank, nummeriert in Ausführungsreihenfolge.
Ausführen: Supabase-Dashboard → SQL Editor → Inhalt einfügen → Run.

- `001_leads.sql` – Tabelle `leads` (Speed-MVP, flach). RLS aktiv ohne Policies: nur der Server mit Secret Key schreibt und liest.
  Enthält ein `grant` für `service_role`, weil „Automatically expose new tables“ im Projekt aus ist.
- `002_dashboard_read.sql` – Leserecht für eingeloggte Nutzer (`authenticated`) per RLS-Policy. Voraussetzung: Selbstregistrierung ist aus.
- `003_confirmation_mail.sql` – Spalten für den Versandstatus der Bestätigungsmail (`pending` / `sent` / `failed`, Zeitpunkt, Fehlergrund).
- `004_contact_model.sql` – Datenmodell Kontakt ↔ Anfrage (Spezifikation: `docs/spezifikation_v3.md`). **Additiv**, `leads` bleibt.
  Fünf Tabellen, Trigger (Methoden-Typ, unveränderliche Methoden, `updated_at`), Matching als Funktion `process_intake`
  (nur `service_role`), Dashboard-Funktionen mit Team-Member-Prüfung (`claim_contact`, `resolve_intake_review`, `set_*` …),
  RLS: eingeloggte Nutzer lesen, schreiben nur über Funktionen.
  **Vor dem Ausführen** im letzten Block die drei Login-E-Mails (Emily, Björn, Michel) eintragen; die Abfrage am Ende muss drei Zeilen zeigen.
- `tests/` – lokale Tests für `004` (siehe `tests/README.md`).
