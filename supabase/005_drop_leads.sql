-- Löscht die alte flache Tabelle `leads` (Speed-MVP, 001–003).
--
-- ERST AUSFÜHREN, wenn
--   1. der Branch `feat/contact-data-model` in `main` gemergt ist,
--   2. das Live-Deployment mit dem neuen Code läuft und
--   3. eine Testanfrage über die Live-URL in `incoming_submissions` angekommen ist.
-- Vorher braucht die Live-App `leads` noch. Nicht umkehrbar; die Daten darin sind nur Testdaten (Entscheidung: nicht übernehmen).
-- Die Policy aus 002 wird mit der Tabelle entfernt.

drop table public.leads;
