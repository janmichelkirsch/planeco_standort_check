# components/dashboard/

Dashboard im Planeco-Design (Vorlage: Figma-Make-Entwurf „Formular im Planeko Design“, Version 3, Route `#dashboard`).
Die Daten lädt der Server (`lib/dashboard-data.ts`, Session-Client mit RLS); die Komponenten bekommen sie als Props.
Interaktive Teile (Menüs, Popups, sofortiges Speichern) sind Client Components und rufen die Server Actions aus `app/admin/actions.ts` auf.

- `ui.tsx` – Bausteine ohne Zustand: `Button`/`buttonClass`, `Select`, `inputClass`, `StatusGlyph`, `StatusBadge`, `ResultBadge`,
  `Avatar` (Farbe nach Position im Team), `UnassignedPill`, `Progress`, `FeedbackLine`, `MailStatusBadge` (Tooltip mit Zeitpunkt/Fehler), `Tag`, `cardClass`, `linkCls`.
- `Popover.tsx` – `Popover` (im Portal, schließt bei Klick daneben, Escape, Scrollen, beim Verstecken der Seite durch `<Activity>`),
  `Menu` (Pfeiltasten, Untermenüs) und `useAnchor()` für Öffnen/Schließen mit Fokus zurück.
