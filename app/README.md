# app/

Seiten und Server-Routen (Next.js App Router).

- `page.tsx` – Startseite mit dem Standort-Check-Formular.
- `layout.tsx` – HTML-Grundgerüst, Sprache `de`, Seitentitel.
- `globals.css` – Tailwind-Import und Grundfarben.
- `login/` – Sales-Login, siehe `login/README.md`.
- `admin/` – Dashboard hinter Login, siehe `admin/README.md`.
- `api/lead/route.ts` – `POST /api/lead`: prüft die Anfrage mit `lib/lead-schema.ts` und speichert sie in Supabase.
  Antworten: `201` gespeichert · `400` kein JSON · `422` Felder ungültig · `500` Speichern fehlgeschlagen (wird geloggt).
