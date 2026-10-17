@AGENTS.md

# Projekt: Planeco Standort-Check

Case Study für Planeco Building (Position Tech & Automation): Interessenten geben über ein mobiles Formular
Grundstücksadresse und Kontaktdaten an, das Sales-Team arbeitet die Anfragen in einem Dashboard ab.

- **Stack:** Next.js 16 (App Router, Cache Components: dynamische Teile in `<Suspense>`) · Supabase (Postgres, später Auth) · Vercel (Hosting) · Brevo (Mail, geplant) · Photon (Adresssuche)
- **Kosten:** Nur kostenlose Dienste.
- **Priorität:** Korrekte, verlustfreie Erfassung der Anfragen geht vor Dashboard und UI-Design.
- **Zielgerät:** Mobile-first (Traffic kommt über Meta/Google-Kampagnen).

## Pflicht-Dokumente – bei jeder Änderung aktuell halten

- `ROADMAP.md` – was geplant ist, in welcher Reihenfolge, was erledigt ist.
- `HANDOVER.md` – Änderungslog, offene Probleme, Feature Requests, Erkenntnisse. Jeder Agent trägt hier ein, was er geändert hat und was offen ist.
- `README.md` in **jedem** Unterordner – beschreibt, was der Ordner enthält und wofür die Dateien da sind. Neuer Ordner → neue README.

## Arbeitsweise

- Iterativ und granular: kleine, lauffähige Schritte, früh deployen und testen.
- **Erst Rückfragen stellen, dann auf "Go" warten**, bevor implementiert wird.
- Sub-Agents nur nach Rückfrage.
- Commit und Push auf `main` sind erlaubt, sobald Lint und Build grün sind.

## Code-Regeln

- Klare Ordnerstruktur nach Verantwortung: `app/` (Seiten, Routen), `components/` (UI), `lib/` (Logik, externe Dienste), `supabase/` (SQL).
- Dateien unter ~500 Zeilen, Funktionen mit einer Aufgabe. UI, Logik und externe Aufrufe trennen.
- Fehler an Modulgrenzen abfangen und loggen (`console.error("[modul] …")`), nie still verschlucken.
  Ein Ausfall von Photon darf das Absenden nie blockieren.
- Validierung immer serverseitig (`lib/lead-schema.ts`), das Formular nutzt dasselbe Schema.
- Keine Secrets im Repo. `.env.local` lokal, Werte in Vercel. `SUPABASE_SECRET_KEY` nur serverseitig (`server-only`).
- Lesen im Dashboard immer über `lib/supabase/session.ts` (RLS greift), nie mit dem Secret Key.
- Commit-Messages im Conventional-Commits-Format (`feat:`, `fix:`, `docs:` …). Vor jedem Commit `npm run lint` und `npm run build`.
