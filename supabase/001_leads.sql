-- Speed-MVP: eine flache Tabelle für eingehende Standort-Check-Anfragen.
-- Normalisierung (contacts/leads), Matching und Tracking folgen in späteren Iterationen.

create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),

  -- Grundstücksadresse
  street         text not null,
  house_number   text not null,
  postal_code    text not null,
  city           text not null,
  -- 'photon' = aus Vorschlag übernommen, 'manual' = selbst eingetippt
  address_source text not null check (address_source in ('photon', 'manual')),
  -- nur gesetzt, wenn die Adresse aus einem Photon-Vorschlag stammt
  state          text,
  latitude       double precision,
  longitude      double precision,

  -- Kontaktdaten
  first_name     text not null,
  last_name      text not null,
  email          text not null,
  phone          text
);

-- RLS an, aber keine Policies: Der öffentliche (anon/publishable) Key kann weder lesen noch schreiben.
-- Geschrieben wird ausschließlich serverseitig mit dem Secret Key, der RLS umgeht.
alter table public.leads enable row level security;

-- "Automatically expose new tables" ist im Projekt aus: Neue Tabellen haben dann keine Rechte.
-- Nur die Server-Rolle (Secret Key) bekommt Zugriff, anon/authenticated bleiben ausgesperrt.
grant select, insert, update, delete on public.leads to service_role;
