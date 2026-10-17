# app/admin/

Internes Dashboard für das Sales-Team (`/admin`). Nur mit Login erreichbar.

Schutz in zwei Schichten: `proxy.ts` leitet ohne Login zu `/login` um, `lib/auth.ts` prüft beim Laden der Daten erneut.
Zusätzlich lässt die Datenbank per RLS nur eingeloggte Nutzer lesen (`supabase/002_dashboard_read.sql`).

- `page.tsx` – Übersicht. Dynamische Teile (Login-Prüfung, Daten) liegen in `<Suspense>` (Cache Components).
- `actions.ts` – Server Action `logout`.
- `export/route.ts` – `GET /admin/export`: alle Anfragen als CSV (seitenweise geladen, also auch über 1000), in der aktuellen Sortierung. Ohne Login `401`.
