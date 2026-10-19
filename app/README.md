# app/

Seiten und Server-Routen (Next.js App Router).

- `page.tsx` – Startseite mit dem Standort-Check-Formular.
- `layout.tsx` – HTML-Grundgerüst, Sprache `de`, Seitentitel.
- `globals.css` – Tailwind-Import und Planeco-Farben (Formular und Dashboard).
- `login/` – Sales-Login, siehe `login/README.md`.
- `admin/` – Dashboard hinter Login, siehe `admin/README.md`.
- `api/` – `POST /api/lead`: prüft und normalisiert die Anfrage (`lib/lead-schema.ts`), speichert sie als Eingang in `incoming_submissions`
  und startet danach Bestätigungsmail und Zuordnung, siehe `api/README.md`.
  Antworten: `201` gespeichert · `200` schon vorhanden (gleiche `clientRequestId`) · `400` kein JSON · `422` Felder ungültig (`fieldErrors`) · `500` Speichern fehlgeschlagen (wird geloggt).
