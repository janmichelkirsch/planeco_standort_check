# Handover

Laufendes Log für alle, die am Projekt arbeiten (Menschen und Agents). Neueste Einträge oben.

## Änderungslog

### 2026-10-17 – Dashboard live getestet
- Live mit Testnutzer geprüft: Login, Tabelle (deutsche Zeit korrekt), Sortierung, CSV-Export, Abmelden + Umleitung.
- Selbstregistrierung in Supabase deaktiviert, `002_dashboard_read.sql` ausgeführt, `SUPABASE_PUBLISHABLE_KEY` in Vercel (Production + Preview).

### 2026-10-17 – Speed-Dashboard
- `/login` (Server Action, Supabase Auth), `/admin` (Tabelle, Sortierung über `?sort=&dir=`), `/admin/export` (CSV).
- Schutz in drei Schichten: `proxy.ts` (Umleitung), `lib/auth.ts` (Prüfung beim Laden), RLS-Policy in der DB.
- Dashboard liest mit dem **Publishable Key + Session** (RLS greift), nicht mit dem Secret Key.
- Neue Env-Variable `SUPABASE_PUBLISHABLE_KEY` (ohne `NEXT_PUBLIC_`, wird nur serverseitig genutzt).
- `lib/supabase-server.ts` → `lib/supabase/admin.ts` verschoben.

### 2026-10-17 – Durchstich live
- Deployt auf Vercel: **https://planeco-standort-check-two.vercel.app** (Auto-Deploy bei Push auf `main`).
- Env-Variablen in Vercel: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (sensitive).
- End-to-End getestet: Anfrage vom Handy kam in `leads` an. Live-API antwortet auf kaputtes JSON korrekt mit 400.

### 2026-10-17 – Supabase-Rechte
- Supabase-Projekt `planeco-case` angelegt (Region **London, eu-west-2**), „Automatically expose new tables“ ist **aus**.
- `001_leads.sql`: `grant … to service_role` ergänzt, sonst hätte auch der Server keine Rechte auf die Tabelle.

### 2026-10-17 – Speed-MVP
- Next.js 16 (App Router, Tailwind) aufgesetzt, Paketname `planeco-standort-check`.
- `supabase/001_leads.sql`: flache Tabelle `leads`, RLS aktiv ohne Policies (nur der Server schreibt).
- `lib/photon.ts`: Adresssuche über Photon, nur DE, nur Häuser und Straßen, Ortsteil im Label.
- `lib/lead-schema.ts`: zod-Schema, gemeinsam für Formular und Server.
- `app/api/lead/route.ts`: POST prüft (400/422), speichert (201) oder loggt Fehler (500).
- `components/LeadForm.tsx`, `components/AddressSearch.tsx`: mobiles Formular, Adresse oben, Kontakt unten.
- Wird eine aus Photon übernommene Adresse nachträglich geändert, gilt sie als `manual`, und Koordinaten/Bundesland werden verworfen.
- Lokal getestet: Suche, Übernahme in Felder, Validierungsfehler, Fehlerfall ohne Supabase-Keys.

## Offene Punkte / Probleme

- Ohne `SUPABASE_PUBLISHABLE_KEY` liefern `/login` und `/admin` einen 500er (Proxy bricht ab). Bei neuen Umgebungen daran denken.
- **Jeder Supabase-Auth-Nutzer sieht alle Anfragen.** Das ist nur sicher, solange die Selbstregistrierung aus ist. Rollen fehlen noch.
- **Tabelle zeigt max. 1000 Zeilen** (Hinweis wird angezeigt), der Export lädt alle seitenweise.
- **CSV:** Werte mit = + - @ am Anfang bekommen ein `'` (Formel-Schutz), betrifft auch `+49…`-Telefonnummern.
  Telefonnummern ohne Leerzeichen mit führender 0 könnte Excel als Zahl lesen (0 fällt weg). Löst sich mit E.164-Normalisierung.
- **CSV-Formate für deutsches Excel noch nicht optimal:** Koordinaten mit Punkt (`51.672678`) liest deutsches Excel ggf. als Text/Datum,
  Datum mit zweistelligem Jahr (`17.10.26, 16:47`). Ideen: Dezimalkomma, `17.10.2026 16:47`.
- Kein Passwort-Reset, kein Rate-Limit auf Login (Supabase hat ein eigenes Basis-Limit).

- **Zeitzone:** `created_at` wird in UTC gespeichert (korrekt). Dashboard und CSV-Export müssen in Europe/Berlin anzeigen.

- **Datenbank-Region London statt Frankfurt.** Bewusst für den Test so belassen. Region lässt sich bei Supabase nicht umstellen,
  ein Umzug heißt neues Projekt + Export/Import + neue Keys in Vercel. Vor dem Livegang erledigen, solange wenige Daten drin sind.
- **Photon findet nicht jede Adresse.** „Am Mühlenteich 7, Groß Grönau“ (Beispiel #5) liefert nur ähnliche, *falsche* Straßen im selben Ort.
  Risiko: Nutzer klickt einen falschen Vorschlag. Ideen: Hinweis „Bitte Vorschlag prüfen“, Straßenname-Abgleich, manuelle Eingabe prominenter.
- **Mehrdeutige Adressen:** „Hauptstraße 14“ existiert mehrfach in Dresden, mit unterschiedlichen PLZ. Die PLZ 01067 aus Beispiel #1 taucht in den Photon-Treffern nicht auf.
  Darum zeigt das Label den Ortsteil. Die Felder bleiben editierbar.
- Photon ist ein öffentlicher Fair-Use-Dienst ohne SLA. Bei Ausfall bleibt die manuelle Eingabe (getestet über Fehleranzeige).
- Noch keine Prüfung, ob PLZ fünfstellig ist, und kein Format für Telefonnummern (bewusst verschoben, siehe Roadmap).
- Kein Schutz vor Doppelklick/Doppel-Submit (Button ist während des Sendens deaktiviert, sonst nichts).

## Feature Requests / Ideen

- Adresssuche: „Bitte Vorschlag prüfen“-Hinweis nach Auswahl.
- Formular-Fortschritt bei schlechter Verbindung im Browser zwischenspeichern.

## Setup-Notizen

- Umgebungsvariablen siehe `.env.example` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`). Lokal in `.env.local`, auf Vercel unter Project Settings → Environment Variables.
- Dev-Server: `npm run dev` im Projektordner.
