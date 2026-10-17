-- Datenmodell Kontakt ↔ Anfrage (Spezifikation: docs/spezifikation_v3.md).
-- Rein additiv: `leads` bleibt unverändert, damit die Live-App auf `main` weiterläuft.
--
-- Inhalt:
--   1. Tabellen         team_members, contacts, contact_methods, incoming_submissions, submissions
--   2. Trigger          Methoden-Typ, unveränderliche Methoden, updated_at
--   3. Hilfsfunktionen  Name normalisieren, Sperren, Methode/Submission anlegen, Team-Member prüfen
--   4. Verarbeitung     process_intake, mark_intake_failed (nur Server)
--   5. Dashboard        intake_candidates, resolve_intake_review, claim_contact, set_* (eingeloggte Team Members)
--   6. Rechte           RLS, grants
--   7. Team Members     am Ende, E-Mails vor dem Ausführen eintragen
--
-- Fehlercodes der Dashboard-Funktionen (kommen in Supabase als error.code an):
--   P0401 kein Team Member · P0404 nicht gefunden · P0409 schon erledigt / Konflikt · P0422 ungültige Eingabe

-- ─── 1. Tabellen ─────────────────────────────────────────────────────────────

create table public.team_members (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (length(btrim(display_name)) > 0),
  created_at   timestamptz not null default now()
);

create table public.contacts (
  id               uuid primary key default gen_random_uuid(),
  first_name       text not null check (length(btrim(first_name)) > 0),
  last_name        text not null check (length(btrim(last_name)) > 0),
  -- NULL = noch nicht übernommen (Inbox „Nicht zugewiesen“)
  account_owner_id uuid references public.team_members(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index contacts_owner_idx on public.contacts (account_owner_id);

create table public.contact_methods (
  id               uuid primary key default gen_random_uuid(),
  contact_id       uuid not null references public.contacts(id) on delete restrict,
  type             text not null check (type in ('email', 'phone')),
  -- E-Mail lowercase, Telefon E.164. Kein globales Unique: Ehepartner dürfen sich Werte teilen.
  normalized_value text not null check (length(normalized_value) > 0),
  created_at       timestamptz not null default now(),
  constraint contact_methods_value_uq unique (contact_id, type, normalized_value),
  -- Ziel des zusammengesetzten Fremdschlüssels aus submissions (Methode gehört zum selben Kontakt)
  constraint contact_methods_owner_uq unique (contact_id, id)
);
create index contact_methods_lookup_idx on public.contact_methods (type, normalized_value);

create table public.incoming_submissions (
  id                   uuid primary key default gen_random_uuid(),
  -- Idempotenz: derselbe Absendevorgang (Doppelklick, Netz-Retry) ergibt nur einen Eingang
  client_request_id    uuid not null unique,
  -- geprüfte Formulardaten (zod-Ausgabe), inkl. Tracking
  payload              jsonb not null,
  normalized_email     text not null check (length(normalized_email) > 0),
  normalized_phone     text not null check (normalized_phone ~ '^\+[1-9][0-9]{6,14}$'),
  status               text not null default 'received'
                         check (status in ('received', 'needs_review', 'processed', 'failed')),
  received_at          timestamptz not null default now(),
  processed_at         timestamptz,
  attempt_count        integer not null default 0 check (attempt_count >= 0),
  last_error           text,
  confirmation_status  text not null default 'pending'
                         check (confirmation_status in ('pending', 'sent', 'failed')),
  confirmation_sent_at timestamptz,
  confirmation_error   text,
  updated_at           timestamptz not null default now(),
  constraint incoming_processed_at_ck check ((status = 'processed') = (processed_at is not null))
);
create index incoming_status_idx on public.incoming_submissions (status, received_at);

create table public.submissions (
  id                   uuid primary key default gen_random_uuid(),
  intake_id            uuid not null unique references public.incoming_submissions(id) on delete restrict,
  contact_id           uuid not null references public.contacts(id) on delete restrict,
  email_method_id      uuid not null,
  phone_method_id      uuid not null,
  -- Name wie eingegeben, bleibt auch nach Korrektur des Kontaktnamens erhalten
  submitted_first_name text not null,
  submitted_last_name  text not null,

  -- Grundstück
  street               text not null,
  house_number         text not null,
  postal_code          text not null,
  city                 text not null,
  address_source       text not null check (address_source in ('photon', 'manual')),
  municipality         text,
  county               text,
  state                text,
  latitude             double precision check (latitude between -90 and 90),
  longitude            double precision check (longitude between -180 and 180),
  -- suggestion = aus Photon-Vorschlag · pending = manuell, noch nicht nachgeschlagen
  geocode_status       text not null
                         check (geocode_status in ('suggestion', 'pending', 'geocoded', 'not_found', 'failed')),

  -- Kampagne
  utm_source           text check (length(utm_source) <= 500),
  utm_medium           text check (length(utm_medium) <= 500),
  utm_campaign         text check (length(utm_campaign) <= 500),
  utm_content          text check (length(utm_content) <= 500),
  utm_term             text check (length(utm_term) <= 500),
  gclid                text check (length(gclid) <= 500),
  fbclid               text check (length(fbclid) <= 500),
  landing_page         text check (length(landing_page) <= 500),
  referrer             text check (length(referrer) <= 500),

  -- Bearbeitung
  status               text not null default 'open' check (status in ('open', 'contacted', 'completed')),
  completed_at         timestamptz,
  outcome              text check (outcome in ('qualified', 'not_qualified', 'unreachable')),
  -- NULL = zuständig ist der Owner des Kontakts
  assigned_to_override uuid references public.team_members(id) on delete set null,
  match_status         text not null
                         check (match_status in ('auto_matched', 'manually_matched', 'new_contact_created')),
  created_at           timestamptz not null,
  updated_at           timestamptz not null default now(),

  constraint submissions_completed_at_ck check ((status = 'completed') = (completed_at is not null)),
  constraint submissions_email_same_contact_fk foreign key (contact_id, email_method_id)
    references public.contact_methods(contact_id, id) on delete restrict,
  constraint submissions_phone_same_contact_fk foreign key (contact_id, phone_method_id)
    references public.contact_methods(contact_id, id) on delete restrict
);
create index submissions_contact_status_idx on public.submissions (contact_id, status);
create index submissions_override_idx on public.submissions (assigned_to_override);

-- ─── 2. Trigger ──────────────────────────────────────────────────────────────

-- Der zusammengesetzte Fremdschlüssel prüft nur den Kontakt, nicht den Typ der Methode.
create function public.check_submission_method_types()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.contact_methods m where m.id = new.email_method_id and m.type = 'email') then
    raise exception 'email_method_id muss auf eine E-Mail zeigen';
  end if;
  if not exists (select 1 from public.contact_methods m where m.id = new.phone_method_id and m.type = 'phone') then
    raise exception 'phone_method_id muss auf eine Telefonnummer zeigen';
  end if;
  return new;
end;
$$;

create trigger submissions_method_types_trg
  before insert or update of contact_id, email_method_id, phone_method_id on public.submissions
  for each row execute function public.check_submission_method_types();

-- Eine Methode, auf die Submissions zeigen, darf ihren Wert nie ändern. Neue Nummer → neue Zeile.
create function public.prevent_contact_method_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.contact_id is distinct from old.contact_id
     or new.type is distinct from old.type
     or new.normalized_value is distinct from old.normalized_value then
    raise exception 'Kontaktmethoden sind unveränderlich, bitte neue Methode anlegen';
  end if;
  return new;
end;
$$;

create trigger contact_methods_immutable_trg
  before update on public.contact_methods
  for each row execute function public.prevent_contact_method_mutation();

create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger contacts_updated_at_trg before update on public.contacts
  for each row execute function public.set_updated_at();
create trigger incoming_updated_at_trg before update on public.incoming_submissions
  for each row execute function public.set_updated_at();
create trigger submissions_updated_at_trg before update on public.submissions
  for each row execute function public.set_updated_at();

-- ─── 3. Hilfsfunktionen ──────────────────────────────────────────────────────

-- Für den Namensvergleich: Leerzeichen zusammenfassen, Unicode NFC, Kleinbuchstaben.
create function public.normalize_person_name(name text)
returns text language sql immutable set search_path = '' as $$
  select lower(normalize(regexp_replace(btrim(name), '\s+', ' ', 'g'), nfc));
$$;

-- Leerer Text → NULL (für optionale Felder aus dem Payload).
create function public.payload_text(payload jsonb, key text)
returns text language sql immutable set search_path = '' as $$
  select nullif(btrim(payload ->> key), '');
$$;

-- Serialisiert gleichzeitige Verarbeitungen mit derselben Mail oder Nummer.
-- Sortierte Reihenfolge, damit sich zwei Transaktionen nicht gegenseitig blockieren.
create function public.lock_contact_keys(p_email text, p_phone text)
returns void language plpgsql set search_path = '' as $$
declare
  k1 bigint := hashtextextended('email:' || p_email, 0);
  k2 bigint := hashtextextended('phone:' || p_phone, 0);
begin
  perform pg_advisory_xact_lock(least(k1, k2));
  if k1 <> k2 then
    perform pg_advisory_xact_lock(greatest(k1, k2));
  end if;
end;
$$;

-- Liefert die Methode des Kontakts, legt sie bei Bedarf an.
create function public.get_or_create_method(p_contact_id uuid, p_type text, p_value text)
returns uuid language plpgsql set search_path = '' as $$
declare
  v_id uuid;
begin
  insert into public.contact_methods (contact_id, type, normalized_value)
  values (p_contact_id, p_type, p_value)
  on conflict (contact_id, type, normalized_value) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from public.contact_methods
    where contact_id = p_contact_id and type = p_type and normalized_value = p_value;
  end if;
  return v_id;
end;
$$;

-- Legt die Submission zu einem Eingang an und markiert den Eingang als verarbeitet.
-- Erwartet, dass der Eingang bereits gesperrt ist.
create function public.finalize_intake(p_intake public.incoming_submissions, p_contact_id uuid, p_match_status text)
returns uuid language plpgsql set search_path = '' as $$
declare
  p jsonb := p_intake.payload;
  v_email_id uuid := public.get_or_create_method(p_contact_id, 'email', p_intake.normalized_email);
  v_phone_id uuid := public.get_or_create_method(p_contact_id, 'phone', p_intake.normalized_phone);
  v_submission_id uuid;
begin
  insert into public.submissions (
    intake_id, contact_id, email_method_id, phone_method_id,
    submitted_first_name, submitted_last_name,
    street, house_number, postal_code, city, address_source,
    municipality, county, state, latitude, longitude, geocode_status,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid, landing_page, referrer,
    match_status, created_at
  ) values (
    p_intake.id, p_contact_id, v_email_id, v_phone_id,
    btrim(p ->> 'firstName'), btrim(p ->> 'lastName'),
    btrim(p ->> 'street'), btrim(p ->> 'houseNumber'), btrim(p ->> 'postalCode'), btrim(p ->> 'city'),
    p ->> 'addressSource',
    public.payload_text(p, 'municipality'), public.payload_text(p, 'county'), public.payload_text(p, 'state'),
    (p ->> 'latitude')::double precision, (p ->> 'longitude')::double precision,
    case when p ->> 'addressSource' = 'photon' then 'suggestion' else 'pending' end,
    public.payload_text(p, 'utmSource'), public.payload_text(p, 'utmMedium'), public.payload_text(p, 'utmCampaign'),
    public.payload_text(p, 'utmContent'), public.payload_text(p, 'utmTerm'),
    public.payload_text(p, 'gclid'), public.payload_text(p, 'fbclid'),
    public.payload_text(p, 'landingPage'), public.payload_text(p, 'referrer'),
    p_match_status, p_intake.received_at
  )
  returning id into v_submission_id;

  update public.incoming_submissions
  set status = 'processed', processed_at = now(), last_error = null
  where id = p_intake.id;

  return v_submission_id;
end;
$$;

-- Team-Member-ID des eingeloggten Nutzers, sonst Fehler P0401.
create function public.require_team_member()
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  select id into v_id from public.team_members where auth_user_id = auth.uid();
  if v_id is null then
    raise exception 'Kein Team Member' using errcode = 'P0401';
  end if;
  return v_id;
end;
$$;

-- ─── 4. Verarbeitung (nur Server, service_role) ──────────────────────────────

-- Ordnet einen Eingang zu. Gibt den neuen Status zurück: processed | needs_review
-- (oder den unveränderten Status, wenn der Eingang schon bearbeitet ist).
-- Wirft bei Fehlern; der Aufrufer setzt dann mark_intake_failed.
create function public.process_intake(p_intake_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_intake      public.incoming_submissions;
  v_email_ids   uuid[];
  v_phone_ids   uuid[];
  v_candidates  uuid[];
  v_contact     public.contacts;
  v_contact_id  uuid;
begin
  select * into v_intake from public.incoming_submissions where id = p_intake_id for update;
  if not found then
    raise exception 'Eingang % nicht gefunden', p_intake_id using errcode = 'P0404';
  end if;
  -- after() und „Erneut verarbeiten“ können gleichzeitig laufen: nur einer arbeitet.
  if v_intake.status not in ('received', 'failed') then
    return v_intake.status;
  end if;

  update public.incoming_submissions set attempt_count = attempt_count + 1 where id = p_intake_id;
  perform public.lock_contact_keys(v_intake.normalized_email, v_intake.normalized_phone);

  select coalesce(array_agg(distinct contact_id), '{}') into v_email_ids
  from public.contact_methods where type = 'email' and normalized_value = v_intake.normalized_email;
  select coalesce(array_agg(distinct contact_id), '{}') into v_phone_ids
  from public.contact_methods where type = 'phone' and normalized_value = v_intake.normalized_phone;
  select coalesce(array_agg(distinct id), '{}') into v_candidates
  from unnest(v_email_ids || v_phone_ids) as id;

  -- Weder Mail noch Telefon bekannt → neuer Kontakt ohne Owner.
  if cardinality(v_candidates) = 0 then
    insert into public.contacts (first_name, last_name)
    values (btrim(v_intake.payload ->> 'firstName'), btrim(v_intake.payload ->> 'lastName'))
    returning id into v_contact_id;
    perform public.finalize_intake(v_intake, v_contact_id, 'new_contact_created');
    return 'processed';
  end if;

  -- Auto-Match nur, wenn genau ein Kontakt über Mail UND Telefon gefunden wurde und der Name gleich ist.
  if cardinality(v_candidates) = 1
     and v_candidates[1] = any (v_email_ids)
     and v_candidates[1] = any (v_phone_ids) then
    select * into v_contact from public.contacts where id = v_candidates[1];
    if public.normalize_person_name(v_contact.first_name) = public.normalize_person_name(v_intake.payload ->> 'firstName')
       and public.normalize_person_name(v_contact.last_name) = public.normalize_person_name(v_intake.payload ->> 'lastName') then
      perform public.finalize_intake(v_intake, v_contact.id, 'auto_matched');
      return 'processed';
    end if;
  end if;

  -- Alles andere entscheidet ein Mensch.
  update public.incoming_submissions set status = 'needs_review', last_error = null where id = p_intake_id;
  return 'needs_review';
end;
$$;

-- Hält einen technischen Fehler fest. Ändert nur Eingänge, die noch nicht zugeordnet sind.
create function public.mark_intake_failed(p_intake_id uuid, p_error text)
returns void language sql security definer set search_path = '' as $$
  update public.incoming_submissions
  set status = 'failed', attempt_count = attempt_count + 1, last_error = left(p_error, 500)
  where id = p_intake_id and status in ('received', 'failed');
$$;

-- ─── 5. Dashboard (eingeloggte Team Members) ─────────────────────────────────

-- Mögliche Kontakte für einen Prüffall, bei jedem Aufruf neu berechnet.
create function public.intake_candidates(p_intake_id uuid)
returns table (
  contact_id uuid, first_name text, last_name text,
  account_owner_id uuid, owner_name text,
  email_match boolean, phone_match boolean, name_match boolean
)
language sql stable security definer set search_path = '' as $$
  with me as (select public.require_team_member()),
  intake as (select * from public.incoming_submissions where id = p_intake_id and exists (select 1 from me)),
  hits as (
    select m.contact_id,
           bool_or(m.type = 'email') as email_match,
           bool_or(m.type = 'phone') as phone_match
    from public.contact_methods m, intake i
    where (m.type = 'email' and m.normalized_value = i.normalized_email)
       or (m.type = 'phone' and m.normalized_value = i.normalized_phone)
    group by m.contact_id
  )
  select c.id, c.first_name, c.last_name, c.account_owner_id, t.display_name,
         h.email_match, h.phone_match,
         public.normalize_person_name(c.first_name) = public.normalize_person_name(i.payload ->> 'firstName')
           and public.normalize_person_name(c.last_name) = public.normalize_person_name(i.payload ->> 'lastName')
  from hits h
  join public.contacts c on c.id = h.contact_id
  left join public.team_members t on t.id = c.account_owner_id
  cross join intake i
  order by (h.email_match and h.phone_match) desc, c.created_at;
$$;

-- Entscheidung aus der Prüfliste. p_action: 'attach_existing' (mit p_contact_id) oder 'create_new'.
-- Optionaler Name: bei attach_existing neuer Kontaktname, bei create_new Name des neuen Kontakts.
-- Speichert bewusst nicht, wer entschieden hat. Gibt die ID der neuen Submission zurück.
create function public.resolve_intake_review(
  p_intake_id uuid, p_action text, p_contact_id uuid default null,
  p_first_name text default null, p_last_name text default null
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_intake     public.incoming_submissions;
  v_contact_id uuid;
  v_first      text := nullif(btrim(p_first_name), '');
  v_last       text := nullif(btrim(p_last_name), '');
begin
  perform public.require_team_member();
  if (v_first is null) <> (v_last is null) then
    raise exception 'Vor- und Nachname nur zusammen angeben' using errcode = 'P0422';
  end if;

  select * into v_intake from public.incoming_submissions where id = p_intake_id for update;
  if not found then
    raise exception 'Eingang nicht gefunden' using errcode = 'P0404';
  end if;
  if v_intake.status <> 'needs_review' then
    raise exception 'Bereits bearbeitet' using errcode = 'P0409';
  end if;

  perform public.lock_contact_keys(v_intake.normalized_email, v_intake.normalized_phone);

  if p_action = 'attach_existing' then
    select id into v_contact_id from public.contacts where id = p_contact_id for update;
    if v_contact_id is null then
      raise exception 'Kontakt nicht gefunden' using errcode = 'P0404';
    end if;
    if v_first is not null then
      update public.contacts set first_name = v_first, last_name = v_last where id = v_contact_id;
    end if;
    return public.finalize_intake(v_intake, v_contact_id, 'manually_matched');
  elsif p_action = 'create_new' then
    insert into public.contacts (first_name, last_name)
    values (coalesce(v_first, btrim(v_intake.payload ->> 'firstName')),
            coalesce(v_last, btrim(v_intake.payload ->> 'lastName')))
    returning id into v_contact_id;
    return public.finalize_intake(v_intake, v_contact_id, 'new_contact_created');
  else
    raise exception 'Unbekannte Aktion %', p_action using errcode = 'P0422';
  end if;
end;
$$;

-- Übernimmt einen Kontakt ohne Owner. Gibt den Owner danach zurück:
-- die eigene ID bei Erfolg, sonst die ID dessen, der schneller war.
create function public.claim_contact(p_contact_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_me    uuid := public.require_team_member();
  v_owner uuid;
begin
  update public.contacts set account_owner_id = v_me
  where id = p_contact_id and account_owner_id is null
  returning account_owner_id into v_owner;

  if v_owner is null then
    select account_owner_id into v_owner from public.contacts where id = p_contact_id;
    if not found then
      raise exception 'Kontakt nicht gefunden' using errcode = 'P0404';
    end if;
  end if;
  return v_owner;
end;
$$;

-- Owner ändern oder freigeben (NULL). Submissions ohne Override wandern mit.
create function public.set_contact_owner(p_contact_id uuid, p_owner_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_team_member();
  update public.contacts set account_owner_id = p_owner_id where id = p_contact_id;
  if not found then
    raise exception 'Kontakt nicht gefunden' using errcode = 'P0404';
  end if;
end;
$$;

create function public.update_contact_name(p_contact_id uuid, p_first_name text, p_last_name text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_team_member();
  if nullif(btrim(p_first_name), '') is null or nullif(btrim(p_last_name), '') is null then
    raise exception 'Vor- und Nachname sind Pflicht' using errcode = 'P0422';
  end if;
  update public.contacts set first_name = btrim(p_first_name), last_name = btrim(p_last_name)
  where id = p_contact_id;
  if not found then
    raise exception 'Kontakt nicht gefunden' using errcode = 'P0404';
  end if;
end;
$$;

-- completed_at: beim ersten Abschluss gesetzt, bleibt bei erneutem „completed“, verschwindet beim Zurücksetzen.
create function public.set_submission_status(p_submission_id uuid, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_team_member();
  if p_status not in ('open', 'contacted', 'completed') then
    raise exception 'Unbekannter Status %', p_status using errcode = 'P0422';
  end if;
  update public.submissions
  set status = p_status,
      completed_at = case when p_status = 'completed' then coalesce(completed_at, now()) end
  where id = p_submission_id;
  if not found then
    raise exception 'Anfrage nicht gefunden' using errcode = 'P0404';
  end if;
end;
$$;

-- NULL setzt das Ergebnis zurück.
create function public.set_submission_outcome(p_submission_id uuid, p_outcome text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_team_member();
  if p_outcome is not null and p_outcome not in ('qualified', 'not_qualified', 'unreachable') then
    raise exception 'Unbekanntes Ergebnis %', p_outcome using errcode = 'P0422';
  end if;
  update public.submissions set outcome = p_outcome where id = p_submission_id;
  if not found then
    raise exception 'Anfrage nicht gefunden' using errcode = 'P0404';
  end if;
end;
$$;

-- NULL = wieder der Owner des Kontakts.
create function public.set_submission_override(p_submission_id uuid, p_team_member_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_team_member();
  update public.submissions set assigned_to_override = p_team_member_id where id = p_submission_id;
  if not found then
    raise exception 'Anfrage nicht gefunden' using errcode = 'P0404';
  end if;
end;
$$;

-- ─── 6. Rechte ───────────────────────────────────────────────────────────────

alter table public.team_members         enable row level security;
alter table public.contacts             enable row level security;
alter table public.contact_methods      enable row level security;
alter table public.incoming_submissions enable row level security;
alter table public.submissions          enable row level security;

-- Server (Secret Key): voller Zugriff, wie bei `leads`.
grant select, insert, update, delete on
  public.team_members, public.contacts, public.contact_methods, public.incoming_submissions, public.submissions
  to service_role;

-- Dashboard (Session): nur lesen. Geschrieben wird ausschließlich über die Funktionen oben.
-- Voraussetzung wie in 002: Selbstregistrierung ist aus, jeder Auth-Nutzer gehört zum Sales-Team.
grant select on
  public.team_members, public.contacts, public.contact_methods, public.incoming_submissions, public.submissions
  to authenticated;

create policy "Sales-Team darf lesen" on public.team_members         for select to authenticated using (true);
create policy "Sales-Team darf lesen" on public.contacts             for select to authenticated using (true);
create policy "Sales-Team darf lesen" on public.contact_methods      for select to authenticated using (true);
create policy "Sales-Team darf lesen" on public.incoming_submissions for select to authenticated using (true);
create policy "Sales-Team darf lesen" on public.submissions          for select to authenticated using (true);

-- Supabase gibt neue Funktionen standardmäßig für alle frei. Erst alles sperren, dann gezielt öffnen.
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.process_intake(uuid)            to service_role;
grant execute on function public.mark_intake_failed(uuid, text)  to service_role;

grant execute on function public.intake_candidates(uuid)                                to authenticated;
grant execute on function public.resolve_intake_review(uuid, text, uuid, text, text)    to authenticated;
grant execute on function public.claim_contact(uuid)                                    to authenticated;
grant execute on function public.set_contact_owner(uuid, uuid)                          to authenticated;
grant execute on function public.update_contact_name(uuid, text, text)                  to authenticated;
grant execute on function public.set_submission_status(uuid, text)                      to authenticated;
grant execute on function public.set_submission_outcome(uuid, text)                     to authenticated;
grant execute on function public.set_submission_override(uuid, uuid)                    to authenticated;
-- require_team_member wird von den Funktionen oben aufgerufen; die laufen als Owner und brauchen kein grant.

-- ─── 7. Team Members ─────────────────────────────────────────────────────────
-- Vor dem Ausführen die Login-E-Mails eintragen (nicht ins Repo committen).
-- Die Abfrage danach muss drei Zeilen zeigen.

insert into public.team_members (auth_user_id, display_name)
select u.id, v.display_name
from (values
  ('<E-Mail von Emily>', 'Emily'),
  ('<E-Mail von Björn>', 'Björn'),
  ('<E-Mail von Michel>', 'Michel')
) as v(email, display_name)
join auth.users u on lower(u.email) = lower(v.email);

select t.display_name, u.email from public.team_members t join auth.users u on u.id = t.auth_user_id;
