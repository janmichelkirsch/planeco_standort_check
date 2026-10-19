# Planeco Standort-Check

Case Study für Planeco Building: mobiles Formular für den kostenlosen Standort-Check und internes Dashboard für das Sales-Team.
Interessenten geben Grundstücksadresse und Kontaktdaten an; die Anfrage wird gespeichert, bestätigt (Mail), einem Kontakt zugeordnet
und im Dashboard abgearbeitet (Zuständigkeit, Status, Ergebnis, Prüfliste, Analyse nach Kanal/Kampagne, CSV-Export).

**Live:** Formular https://planeco-standort-check-two.vercel.app · Dashboard https://planeco-standort-check-two.vercel.app/admin (Login nötig)

Stack: Next.js 16 · Supabase (Postgres, Auth) · Vercel · Brevo (Mail) · Photon (Adresssuche). Nur kostenlose Dienste.

## Struktur

| Ordner | Inhalt |
|---|---|
| `app/` | Seiten und Server-Routen (Next.js App Router) |
| `components/` | UI-Komponenten: Formular, Dashboard (`components/dashboard/`) |
| `lib/` | Logik und Anbindung externer Dienste (Photon, Supabase, Validierung) |
| `supabase/` | SQL für die Datenbank |
| `docs/` | Spezifikation Datenmodell v3 |

`proxy.ts` im Hauptordner schützt `/admin` (Login-Pflicht) und erneuert die Session.

Planung: [`ROADMAP.md`](ROADMAP.md) · Änderungen und offene Punkte: [`HANDOVER.md`](HANDOVER.md) · Regeln für Agents: [`CLAUDE.md`](CLAUDE.md)

## Lokal starten

```bash
cp .env.example .env.local   # Werte eintragen
npm install
npm run dev
```

Tests: `npm test` (Vitest, Unit-Tests in `lib/`) · Datenbank-Tests: `supabase/tests/run.sh`
