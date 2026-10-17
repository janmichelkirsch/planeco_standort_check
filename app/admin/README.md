# app/admin/

Internes Dashboard für das Sales-Team (`/admin`). Nur mit Login erreichbar.

Schutz in zwei Schichten: `proxy.ts` leitet ohne Login zu `/login` um, `lib/auth.ts` prüft beim Laden der Daten erneut.
Zusätzlich lässt die Datenbank per RLS nur eingeloggte Nutzer lesen (`supabase/004_contact_model.sql`).

- `page.tsx` – Kontaktorientierte Übersicht (`?view=open|unassigned|mine|all`, `?sort=latest|name|owner&dir=…`), Standard „Offen“, neueste zuerst.
  Hinweise auf Prüffälle/nicht verarbeitete Eingänge. Dynamische Teile (Login-Prüfung, Daten) liegen in `<Suspense>` (Cache Components).
- `actions.ts` – Server Actions `logout` und `reprocessIntakes` („Erneut verarbeiten“: `process_intake` für `received`/`failed`, mit Secret Key nach Login-Prüfung).
- `export/route.ts` – `GET /admin/export`: alle Anfragen als CSV, neueste zuerst, eine Zeile pro Anfrage plus Eingänge in Prüfung / nicht verarbeitet (Spalte „Verarbeitung“). Ohne Login `401`.
