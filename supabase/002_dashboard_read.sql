-- Dashboard: Eingeloggte Sales-Nutzer dürfen Anfragen lesen.
-- Zusätzlich zur Login-Prüfung im Code sperrt damit auch die Datenbank selbst alle anderen aus.
-- Voraussetzung: Selbstregistrierung ist in Supabase deaktiviert, jeder Auth-Nutzer gehört zum Sales-Team.

grant select on public.leads to authenticated;

create policy "Sales-Team darf Anfragen lesen"
  on public.leads
  for select
  to authenticated
  using (true);
