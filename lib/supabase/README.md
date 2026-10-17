# lib/supabase/

Supabase-Clients, getrennt nach Zweck. Alle nur serverseitig.

- `admin.ts` – Client mit **Secret Key**, umgeht RLS. Nur für das Speichern neuer Anfragen (`/api/lead`).
