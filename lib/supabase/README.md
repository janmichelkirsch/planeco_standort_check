# lib/supabase/

Supabase-Clients, getrennt nach Zweck. Alle nur serverseitig.

- `admin.ts` – Client mit **Secret Key**, umgeht RLS. Nur für das Speichern neuer Anfragen (`/api/lead`).
- `session.ts` – Client im Namen des eingeloggten Nutzers (Cookies + **Publishable Key**). Unterliegt RLS, für das Dashboard.
- `env.ts` – liest die Supabase-Umgebungsvariablen und meldet klar, wenn eine fehlt.
- `proxy-session.ts` – erneuert die Login-Session im Proxy (`/proxy.ts`) und meldet, ob jemand eingeloggt ist.
