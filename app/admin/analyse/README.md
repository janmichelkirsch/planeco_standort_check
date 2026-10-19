# app/admin/analyse/

`/admin/analyse` (Case Pflicht 6, Auswertbarkeit): Welche Kanäle und Kampagnen bringen Anfragen, und wie viele davon sind qualifiziert?

- `page.tsx` – lädt alle Anfragen (Session-Client, RLS) und die offenen Eingänge, baut daraus schlanke Zeilen (`lib/analyse.ts`)
  und gibt sie mit dem heutigen Berliner Datum an `components/dashboard/analyse/Analyse.tsx`. Filtern und Zählen passiert im Browser.
