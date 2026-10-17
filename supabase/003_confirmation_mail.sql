-- Bestätigungsmail: Versandstatus pro Anfrage.
-- 'pending' wird beim Speichern gesetzt. Bleibt der Wert stehen, ist der Versand nie abgeschlossen worden.

alter table public.leads
  add column confirmation_status  text not null default 'pending'
    check (confirmation_status in ('pending', 'sent', 'failed')),
  add column confirmation_sent_at timestamptz,
  add column confirmation_error   text;
