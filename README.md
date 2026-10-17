# Planeco Standort-Check

Mobiles Formular für den kostenlosen Standort-Check: Interessenten geben Grundstücksadresse und Kontaktdaten an,
die Anfrage wird in Supabase gespeichert.

## Struktur

| Ordner | Inhalt |
|---|---|
| `app/` | Seiten und Server-Routen (Next.js App Router) |
| `components/` | UI-Komponenten des Formulars |
| `lib/` | Logik und Anbindung externer Dienste (Photon, Supabase, Validierung) |
| `supabase/` | SQL für die Datenbank |

Planung: [`ROADMAP.md`](ROADMAP.md) · Änderungen und offene Punkte: [`HANDOVER.md`](HANDOVER.md) · Regeln für Agents: [`CLAUDE.md`](CLAUDE.md)

## Lokal starten

```bash
cp .env.example .env.local   # Werte eintragen
npm install
npm run dev
```
