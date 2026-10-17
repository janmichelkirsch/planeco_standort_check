# lib/

Logik und Anbindung externer Dienste, ohne UI.

- `lead-schema.ts` – zod-Schema einer Anfrage, gemeinsam für Formular und Server.
- `photon.ts` – Adresssuche über Photon (kostenlos, kein Key). Wandelt Treffer in unsere Adressfelder um (nur DE, nur Häuser und Straßen).
- `supabase-server.ts` – Supabase-Client mit Secret Key. Nur serverseitig importierbar (`server-only`).
