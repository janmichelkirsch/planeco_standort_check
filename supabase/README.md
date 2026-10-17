# supabase/

SQL-Dateien für die Datenbank, nummeriert in Ausführungsreihenfolge.
Ausführen: Supabase-Dashboard → SQL Editor → Inhalt einfügen → Run.

- `001_leads.sql` – Tabelle `leads` (Speed-MVP, flach). RLS aktiv ohne Policies: nur der Server mit Secret Key schreibt und liest.
  Enthält ein `grant` für `service_role`, weil „Automatically expose new tables“ im Projekt aus ist.
- `002_dashboard_read.sql` – Leserecht für eingeloggte Nutzer (`authenticated`) per RLS-Policy. Voraussetzung: Selbstregistrierung ist aus.
