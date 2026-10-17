# app/api/

Server-Routen (Route Handlers).

- `lead/route.ts` – `POST /api/lead`: prüft und normalisiert eine Standort-Check-Anfrage, speichert sie als Eingang in `incoming_submissions`
  (idempotent über `clientRequestId`: `201` neu, `200` schon vorhanden) und startet danach per `after()` Bestätigungsmail und Zuordnung (`process_intake`).
