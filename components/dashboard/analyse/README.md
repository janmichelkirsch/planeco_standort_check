# components/dashboard/analyse/

Analyse-Seite im Planeco-Design (Vorlage: Figma-Entwurf, Route `#dashboard/analyse`). Rechnet mit `lib/analyse.ts`.

- `Analyse.tsx` – Client Component: Filter (Zeitraum 7/14/30 Tage/Gesamt + Von/Bis, Kanal, Kampagne), leerer Zustand, Kacheln, Tabelle, Verlauf, Rückmeldung/Datenqualität.
- `Kpis.tsx` – vier Kacheln (mit Sparkline bei Anfragen und Qualifiziert): Anfragen (± Vorperiode, in Prüfung), Qualifiziert (Quote der bewerteten), Meiste Anfragen (Menge), Kampagnen mit Anfragen.
- `CompareTable.tsx` – Vergleichstabelle Kanal → Kampagnen: Anfragen, mit Ergebnis, qualifiziert, nicht qualifiziert, nicht erreicht, Quote („wenig Daten“ unter 5 bewerteten).
- `Trend.tsx` – „Anfragen im Verlauf“: gesamt / nach Kanal / nach Kampagne, alle oder nur qualifizierte, täglich oder kumuliert; Linien ein-/ausblendbar.
- `Insights.tsx` – „Rückmeldung“ (Ring mit Ergebnis-Verteilung) und „Datenqualität“ (Adresse mit fünf Zuständen, Bestätigungsmail, Herkunft).
- `charts.tsx` – SVG-Diagramme ohne Bibliothek: `LineChart` (Tooltip), `DataTable` (für Screenreader), `Sparkline`, `Donut`.
- `Segmented.tsx` – Umschalter für Zeitraum, Gruppierung, Darstellung.
