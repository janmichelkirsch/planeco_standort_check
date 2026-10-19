# components/dashboard/analyse/

Analyse-Seite im Planeco-Design (Vorlage: Figma-Entwurf, Route `#dashboard/analyse`). Rechnet mit `lib/analyse.ts`.

- `Analyse.tsx` – Client Component: Filter (Zeitraum 7/14/30 Tage/Gesamt + Von/Bis, Kanal, Kampagne), leerer Zustand, Kacheln und Tabelle.
- `Kpis.tsx` – vier Kacheln: Anfragen (± Vorperiode, in Prüfung), Qualifiziert (Quote der bewerteten), Meiste Anfragen (Menge), Kampagnen mit Anfragen.
- `CompareTable.tsx` – Vergleichstabelle Kanal → Kampagnen: Anfragen, mit Ergebnis, qualifiziert, nicht qualifiziert, nicht erreicht, Quote („wenig Daten“ unter 5 bewerteten).
