# components/

UI-Komponenten (Client Components).

- `LeadForm.tsx` – das Formular: Grundstücksadresse oben, Kontaktdaten unten. Sendet an `/api/lead`, behält Eingaben bei Fehlern.
- `AddressSearch.tsx` – Combobox mit Photon-Vorschlägen (Tastatur: ↑ ↓ Enter Esc), Zustände Laden/Keine Treffer/Nicht erreichbar, Link „Manuell eingeben“. `inline` = Vorschläge im Seitenfluss (Mobile).
- `AddressFields.tsx` – bearbeitbare Adressfelder (Straße, Nr., PLZ, Ort), vorausgefüllt nach Vorschlag mit Prüfhinweis oder leer für die manuelle Eingabe.
- `LoginForm.tsx` – Login-Formular für `/login` (E-Mail, Passwort, Fehlermeldung).
- `LeadsTable.tsx` – Tabelle aller Anfragen im Dashboard. Zeiten in deutscher Zeit, Telefon und E-Mail klickbar, auf dem Handy seitlich scrollbar.
- `SortableHeader.tsx` – klickbare Spaltenüberschrift: setzt `?sort=…&dir=…` in der URL, zweiter Klick dreht die Richtung um.
- `icons.tsx` – Linien-Icons aus dem Figma-Entwurf (Pfeile, Lupe, Pin, Häkchen, Warnung, Stift, Spinner).
- `Field.tsx` – Formular-Bausteine im Planeco-Design: `Field` (Label + Eingabe + Hinweis + Fehler), `Label`, `FieldError`, Klassen `inputBase`/`inputBorder`.
