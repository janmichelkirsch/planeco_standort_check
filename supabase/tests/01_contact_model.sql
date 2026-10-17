\set QUIET on
create function pg_temp.intake(fn text, ln text, mail text, phone text, src text default 'manual', extra jsonb default '{}')
returns uuid language sql as $$
  insert into public.incoming_submissions (client_request_id, payload, normalized_email, normalized_phone)
  values (gen_random_uuid(),
          jsonb_build_object('firstName', fn, 'lastName', ln, 'email', mail, 'phone', phone,
                             'street', 'Hauptstraße', 'houseNumber', '14', 'postalCode', '01067', 'city', 'Dresden',
                             'addressSource', src, 'state', null, 'latitude', null, 'longitude', null) || extra,
          lower(btrim(mail)), phone)
  returning id $$;
create function pg_temp.status(i uuid) returns text language sql as $$ select status from public.incoming_submissions where id = i $$;
create function pg_temp.contact_of(i uuid) returns uuid language sql as $$ select contact_id from public.submissions where intake_id = i $$;
create function pg_temp.match_of(i uuid) returns text language sql as $$ select match_status from public.submissions where intake_id = i $$;
create function pg_temp.ok(name text) returns void language plpgsql as $$ begin raise notice 'OK  %', name; end $$;
create table pg_temp.ids (k text primary key, v uuid);

-- ── Matching ────────────────────────────────────────────────────────────────
do $$
declare i1 uuid; i2 uuid; c1 uuid; r text; n int;
begin
  i1 := pg_temp.intake('Thomas', 'Ahrens', 'thomas@test.local', '+4940123456', 'photon',
                       '{"state":"Sachsen","latitude":51.05,"longitude":13.74,"municipality":"Dresden","county":"Dresden","utmSource":"meta","utmCampaign":"sommer","gclid":"  "}');
  r := public.process_intake(i1);
  c1 := pg_temp.contact_of(i1);
  assert r = 'processed' and pg_temp.match_of(i1) = 'new_contact_created', 'T1 neuer Kontakt';
  assert (select account_owner_id from public.contacts where id = c1) is null, 'T1 kein Owner';
  assert (select geocode_status = 'suggestion' and utm_source = 'meta' and gclid is null and state = 'Sachsen'
          from public.submissions where intake_id = i1), 'T1 Felder aus Payload';
  assert (select processed_at is not null and attempt_count = 1 from public.incoming_submissions where id = i1), 'T1 processed_at';
  perform pg_temp.ok('T1 kein Treffer → neuer Kontakt ohne Owner, Payload-Felder übernommen');
  insert into pg_temp.ids values ('c1', c1);

  -- Case-Beispiel 4: gleicher Mensch, Name anders geschrieben (Leerzeichen, Großschreibung)
  i2 := pg_temp.intake('  thomas ', 'AHRENS', ' Thomas@Test.local ', '+4940123456');
  r := public.process_intake(i2);
  assert r = 'processed' and pg_temp.contact_of(i2) = c1 and pg_temp.match_of(i2) = 'auto_matched', 'T2 Auto-Match';
  select count(*) into n from public.contact_methods where contact_id = c1;
  assert n = 2, 'T2 Methoden wiederverwendet';
  assert (select geocode_status from public.submissions where intake_id = i2) = 'pending', 'T2 manuell → pending';
  perform pg_temp.ok('T2 Dreifachtreffer → Auto-Match, Methoden wiederverwendet');

  r := public.process_intake(i2);
  select count(*) into n from public.submissions where intake_id = i2;
  assert r = 'processed' and n = 1, 'T2b erneut verarbeiten';
  perform pg_temp.ok('T2b bereits verarbeiteter Eingang → keine zweite Submission');
end $$;

do $$
declare c1 uuid := (select v from pg_temp.ids where k = 'c1'); i uuid; r text; n int;
begin
  i := pg_temp.intake('Thomas', 'Ahrens', 'thomas@test.local', '+491701234567');
  r := public.process_intake(i);
  select count(*) into n from public.submissions where intake_id = i;
  assert r = 'needs_review' and n = 0, 'T3 gleiche Mail, neue Nummer';
  insert into pg_temp.ids values ('i_newphone', i);
  perform pg_temp.ok('T3 gleiche Mail, neue Nummer → Prüfung, keine Submission');

  i := pg_temp.intake('Tom', 'Ahrens', 'thomas@test.local', '+4940123456');
  assert public.process_intake(i) = 'needs_review', 'T4 Name anders';
  insert into pg_temp.ids values ('i_tom', i);
  perform pg_temp.ok('T4 Mail+Telefon gleich, Name anders (Tom/Thomas) → Prüfung');

  -- HANDOVER-Fall: gleiche Nummer, andere Mail, anderer Name
  i := pg_temp.intake('Jan Michel', 'Kirsch', 'jan@test.local', '+4917011111111');
  assert public.process_intake(i) = 'processed', 'T5a';
  insert into pg_temp.ids values ('c_jan', pg_temp.contact_of(i));
  i := pg_temp.intake('Michel', 'Kirsch', 'michel.k@test.local', '+4917011111111');
  assert public.process_intake(i) = 'needs_review', 'T5 nur Telefon';
  insert into pg_temp.ids values ('i_michel', i);
  perform pg_temp.ok('T5 nur Telefon gleich (Jan Michel / Michel Kirsch) → Prüfung');

  i := pg_temp.intake('Marion', 'Beckmann', 'marion@test.local', '+491705551234');
  assert public.process_intake(i) = 'processed', 'T6a';
  i := pg_temp.intake('Thomas', 'Ahrens', 'thomas@test.local', '+491705551234');
  assert public.process_intake(i) = 'needs_review', 'T6 Konflikt';
  insert into pg_temp.ids values ('i_conflict', i);
  perform pg_temp.ok('T6 Mail von A, Telefon von B → Prüfung');

  -- Gleicher Name und Grundstück, aber weder Mail noch Telefon bekannt
  i := pg_temp.intake('Thomas', 'Ahrens', 'other@test.local', '+4930999999');
  assert public.process_intake(i) = 'processed' and pg_temp.contact_of(i) <> c1, 'T7';
  perform pg_temp.ok('T7 gleicher Name/Grundstück, andere Mail+Telefon → neuer Kontakt');
end $$;

-- ── Prüfliste (als eingeloggter Team Member) ────────────────────────────────
grant select on pg_temp.ids to authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000e1';
set role authenticated;
do $$
declare c1 uuid := (select v from pg_temp.ids where k = 'c1'); i uuid; s uuid; n int; c record;
begin
  i := (select v from pg_temp.ids where k = 'i_conflict');
  select count(*) into n from public.intake_candidates(i);
  assert n = 2, 'R1 zwei Kandidaten';
  select * into c from public.intake_candidates(i) where contact_id = c1;
  assert c.email_match and not c.phone_match and c.name_match, 'R1 Begründung';
  perform pg_temp.ok('R1 Kandidaten mit Begründung (Mail ja / Telefon nein / Name ja)');

  i := (select v from pg_temp.ids where k = 'i_newphone');
  s := public.resolve_intake_review(i, 'attach_existing', c1);
  assert (select contact_id = c1 and match_status = 'manually_matched' from public.submissions where id = s), 'R2';
  select count(*) into n from public.contact_methods where contact_id = c1 and type = 'phone';
  assert n = 2, 'R2 neue Telefon-Methode';
  assert (select status from public.incoming_submissions where id = i) = 'processed', 'R2 status';
  perform pg_temp.ok('R2 Zuordnen → neue Telefon-Methode am Kontakt, Eingang processed');

  begin
    perform public.resolve_intake_review(i, 'attach_existing', c1);
    assert false, 'R3 hätte fehlschlagen müssen';
  exception when sqlstate 'P0409' then perform pg_temp.ok('R3 zweites Auflösen → P0409 „Bereits bearbeitet“');
  end;

  i := (select v from pg_temp.ids where k = 'i_tom');
  s := public.resolve_intake_review(i, 'attach_existing', c1, 'Thomas', 'Ahrens');
  assert (select submitted_first_name from public.submissions where id = s) = 'Tom', 'R4 Originalname';
  perform pg_temp.ok('R4 Tom → Thomas zugeordnet, eingegebener Name „Tom“ bleibt an der Submission');

  i := (select v from pg_temp.ids where k = 'i_michel');
  s := public.resolve_intake_review(i, 'create_new');
  assert (select match_status from public.submissions where id = s) = 'new_contact_created', 'R5';
  select count(distinct contact_id) into n from public.contact_methods where type = 'phone' and normalized_value = '+4917011111111';
  assert n = 2, 'R5 geteilte Nummer';
  perform pg_temp.ok('R5 Neuer Kontakt mit geteilter Nummer erlaubt (kein globales Unique)');

  assert not exists (select 1 from information_schema.columns
                     where table_schema = 'public' and column_name ilike '%review%'), 'R6';
  perform pg_temp.ok('R6 keine Spalte speichert, wer geprüft hat');
end $$;
reset role;

-- Geteilte Nummer: nächster Eingang mit dieser Nummer ist mehrdeutig
do $$
declare i uuid;
begin
  i := pg_temp.intake('Michel', 'Kirsch', 'michel.k@test.local', '+4917011111111');
  assert public.process_intake(i) = 'needs_review', 'M1';
  perform pg_temp.ok('M1 Nummer gehört zwei Kontakten → Prüfung, auch wenn Mail+Name zu einem passen');
end $$;

-- ── Zuständigkeit und Status ────────────────────────────────────────────────
set role authenticated;
do $$
declare c1 uuid := (select v from pg_temp.ids where k = 'c1'); emily uuid; owner uuid; s uuid; n_total int; n_done int;
begin
  select id into emily from public.team_members where display_name = 'Emily';
  owner := public.claim_contact(c1);
  assert owner = emily, 'Z1';
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', true);
  owner := public.claim_contact(c1);
  assert owner = emily, 'Z2 Björn verliert';
  perform pg_temp.ok('Z1/Z2 Emily übernimmt, Björn bekommt Emily als Owner zurück (kein Überschreiben)');

  select id into s from public.submissions where contact_id = c1 order by created_at limit 1;
  perform public.set_submission_status(s, 'completed');
  assert (select completed_at is not null from public.submissions where id = s), 'Z3';
  perform public.set_submission_status(s, 'contacted');
  assert (select completed_at is null from public.submissions where id = s), 'Z3b';
  perform public.set_submission_status(s, 'completed');
  perform public.set_submission_outcome(s, 'qualified');
  perform public.set_submission_override((select id from public.submissions where contact_id = c1 order by created_at offset 1 limit 1),
                                         (select id from public.team_members where display_name = 'Björn'));
  select count(*), count(*) filter (where status = 'completed') into n_total, n_done from public.submissions where contact_id = c1;
  perform pg_temp.ok(format('Z3 Status/completed_at/Ergebnis/Override gesetzt, Fortschritt %s/%s', n_done, n_total));

  begin
    perform public.set_submission_outcome(s, 'super');
    assert false;
  exception when sqlstate 'P0422' then perform pg_temp.ok('Z4 ungültiges Ergebnis → P0422');
  end;

  begin
    update public.contacts set account_owner_id = null where id = c1;
    assert false;
  exception when insufficient_privilege then perform pg_temp.ok('Z5 direktes UPDATE als authenticated verboten');
  end;

  begin
    perform public.process_intake(gen_random_uuid());
    assert false;
  exception when insufficient_privilege then perform pg_temp.ok('Z6 process_intake für authenticated gesperrt');
  end;

  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000099', true);
  begin
    perform public.claim_contact(c1);
    assert false;
  exception when sqlstate 'P0401' then perform pg_temp.ok('Z7 eingeloggt, aber kein Team Member → P0401');
  end;
end $$;
reset role;

set role anon;
do $$
begin
  begin
    perform 1 from public.contacts;
    assert false;
  exception when insufficient_privilege then perform pg_temp.ok('Z8 anon kann nichts lesen');
  end;
  begin
    perform public.claim_contact(gen_random_uuid());
    assert false;
  exception when insufficient_privilege then perform pg_temp.ok('Z9 anon kann keine Funktion ausführen');
  end;
end $$;
reset role;

-- ── Integrität ──────────────────────────────────────────────────────────────
do $$
declare c1 uuid := (select v from pg_temp.ids where k = 'c1'); c_jan uuid := (select v from pg_temp.ids where k = 'c_jan');
        s record; phone_c1 uuid; mail_jan uuid; i uuid;
begin
  select * into s from public.submissions where contact_id = c1 limit 1;
  select id into phone_c1 from public.contact_methods where contact_id = c1 and type = 'phone' limit 1;
  select id into mail_jan from public.contact_methods where contact_id = c_jan and type = 'email';

  begin
    update public.submissions set email_method_id = phone_c1 where id = s.id;
    assert false;
  exception when raise_exception then perform pg_temp.ok('I1 Telefon-ID im Mail-Feld → abgelehnt');
  end;
  begin
    update public.submissions set email_method_id = mail_jan where id = s.id;
    assert false;
  exception when foreign_key_violation then perform pg_temp.ok('I2 Methode eines anderen Kontakts → abgelehnt');
  end;
  begin
    update public.contact_methods set normalized_value = 'neu@test.local' where id = s.email_method_id;
    assert false;
  exception when raise_exception then perform pg_temp.ok('I3 Methodenwert ändern → abgelehnt');
  end;
  begin
    update public.submissions set status = 'completed', completed_at = null where id = s.id;
    assert false;
  exception when check_violation then perform pg_temp.ok('I4 completed ohne completed_at → abgelehnt');
  end;

  i := pg_temp.intake('X', 'Y', 'x@test.local', '+4930111111');
  insert into public.incoming_submissions (client_request_id, payload, normalized_email, normalized_phone)
  select client_request_id, payload, normalized_email, normalized_phone from public.incoming_submissions where id = i
  on conflict (client_request_id) do nothing;
  assert (select count(*) from public.incoming_submissions where normalized_email = 'x@test.local') = 1, 'I5';
  perform pg_temp.ok('I5 gleiche client_request_id → nur ein Eingang');

  perform public.mark_intake_failed(i, 'Testfehler');
  assert (select status = 'failed' and attempt_count = 1 from public.incoming_submissions where id = i), 'I6a';
  assert public.process_intake(i) = 'processed', 'I6';
  assert (select attempt_count = 2 and last_error is null from public.incoming_submissions where id = i), 'I6b';
  perform pg_temp.ok('I6 failed → erneut verarbeiten → processed, Versuche gezählt');

  perform public.mark_intake_failed(i, 'zu spät');
  assert (select status from public.incoming_submissions where id = i) = 'processed', 'I7';
  perform pg_temp.ok('I7 mark_intake_failed ändert verarbeitete Eingänge nicht');

  begin
    insert into public.incoming_submissions (client_request_id, payload, normalized_email, normalized_phone)
    values (gen_random_uuid(), '{}', 'a@test.local', '0170123');
    assert false;
  exception when check_violation then perform pg_temp.ok('I8 Telefon nicht im E.164-Format → abgelehnt');
  end;
end $$;
