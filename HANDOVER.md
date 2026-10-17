# Handover

Laufendes Log für alle, die am Projekt arbeiten (Menschen und Agents). Neueste Einträge oben.

## Änderungslog

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

- Umgebungsvariablen siehe `.env.example`. Lokal in `.env.local`, auf Vercel unter Project Settings → Environment Variables.
- Dev-Server: `npm run dev` im Projektordner.
