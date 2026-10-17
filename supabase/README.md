# supabase/

SQL-Dateien für die Datenbank, nummeriert in Ausführungsreihenfolge.
Ausführen: Supabase-Dashboard → SQL Editor → Inhalt einfügen → Run.

- `001_leads.sql` – Tabelle `leads` (Speed-MVP, flach). RLS aktiv ohne Policies: nur der Server mit Secret Key schreibt und liest.
