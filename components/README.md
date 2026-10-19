# components/

UI-Komponenten (Client Components).

Das neue Dashboard im Planeco-Design liegt in [`dashboard/`](dashboard/README.md).

- `StandortForm.tsx` – Einstieg des Formulars: hält den gemeinsamen Zustand (`lib/use-lead-form.ts`) und wählt ab 640 px Breite die Desktop-, darunter die Mobile-Variante. Eingaben bleiben beim Wechsel erhalten.
- `DesktopForm.tsx` – Desktop-Variante: links Nutzenversprechen, Ablauf und Bild, rechts eine Formular-Karte mit beiden Abschnitten.
- `MobileForm.tsx` – Handy-Variante im Planeco-Design: zwei Schritte (Grundstück → Kontakt), Aktionsleiste unten, Erfolgsseite. Fehler beim Senden erscheinen in der Aktionsleiste.
- `FormParts.tsx` – gemeinsame Teile: Logo, Absende-Button, Datenschutz-Hinweis, Fehlermeldung beim Senden, Ablauf „So geht's weiter“.
- `AddressSearch.tsx` – Combobox mit Photon-Vorschlägen (Tastatur: ↑ ↓ Enter Esc), Zustände Laden/Keine Treffer/Nicht erreichbar, Link „Manuell eingeben“. `inline` = Vorschläge im Seitenfluss (Mobile).
- `AddressFields.tsx` – bearbeitbare Adressfelder (Straße, Nr., PLZ, Ort), vorausgefüllt nach Vorschlag mit Prüfhinweis oder leer für die manuelle Eingabe.
- `LoginForm.tsx` – Login-Formular für `/login` (E-Mail, Passwort, Fehlermeldung).
- `icons.tsx` – Linien-Icons aus dem Figma-Entwurf (Formular: Pfeile, Lupe, Pin, Häkchen, Warnung, Stift, Spinner; Dashboard: Telefon, Mail, Sortierung, Menüs, Personen, Diagramm …).
- `PhoneField.tsx` – Telefon mit Vorwahl-Dropdown (Flagge + Vorwahl, darunter native Länderliste: DE/AT/CH oben, dann alle alphabetisch) und Nummernfeld mit Formatierung beim Tippen. Eingefügte Nummern mit `+…`/`00…` ersetzen den Inhalt und stellen das Land um. Logik in `lib/phone-input.ts`.
- `Field.tsx` – Formular-Bausteine im Planeco-Design: `Field` (Label + Eingabe + Hinweis + Fehler), `Label`, `FieldError`, Klassen `inputBase`/`inputBorder`.
