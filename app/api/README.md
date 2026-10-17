# app/api/

Server-Routen (Route Handlers).

- `lead/route.ts` – `POST /api/lead`: nimmt eine Standort-Check-Anfrage an, prüft sie, speichert sie mit dem Secret Key und verschickt danach per `after()` die Bestätigungsmail.
