# lib/

Logik und Anbindung externer Dienste, ohne UI.

- `lead-schema.ts` – zod-Schema einer Anfrage, gemeinsam für Formular und Server.
- `photon.ts` – Adresssuche über Photon (kostenlos, kein Key). Wandelt Treffer in unsere Adressfelder um (nur DE, nur Häuser und Straßen).
- `supabase/` – Supabase-Clients, getrennt nach Zweck (siehe `supabase/README.md`).
- `auth.ts` – `requireSalesUser()`: prüft den Login serverseitig und leitet sonst zu `/login` um.
