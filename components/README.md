# components/

UI-Komponenten (Client Components).

- `StandortForm.tsx` – Einstieg des Formulars: hält den gemeinsamen Zustand (`lib/use-lead-form.ts`) und wählt ab 640 px Breite die Desktop-, darunter die Mobile-Variante. Eingaben bleiben beim Wechsel erhalten.
- `DesktopForm.tsx` – Desktop-Variante: links Nutzenversprechen, Ablauf und Bild, rechts eine Formular-Karte mit beiden Abschnitten.
- `MobileForm.tsx` – Handy-Variante im Planeco-Design: zwei Schritte (Grundstück → Kontakt), Aktionsleiste unten, Erfolgsseite. Fehler beim Senden erscheinen in der Aktionsleiste.
- `FormParts.tsx` – gemeinsame Teile: Logo, Absende-Button, Datenschutz-Hinweis, Fehlermeldung beim Senden, Ablauf „So geht's weiter“.
- `AddressSearch.tsx` – Combobox mit Photon-Vorschlägen (Tastatur: ↑ ↓ Enter Esc), Zustände Laden/Keine Treffer/Nicht erreichbar, Link „Manuell eingeben“. `inline` = Vorschläge im Seitenfluss (Mobile).
- `AddressFields.tsx` – bearbeitbare Adressfelder (Straße, Nr., PLZ, Ort), vorausgefüllt nach Vorschlag mit Prüfhinweis oder leer für die manuelle Eingabe.
- `LoginForm.tsx` – Login-Formular für `/login` (E-Mail, Passwort, Fehlermeldung).
- `ContactList.tsx` – Dashboard: ein Eintrag pro Kontakt (Name, Zuständig + „auch …“, Fortschritt, neueste Anfrage, Hinweis „automatisch zugeordnet“),
  aufklappbar per `<details>` zu den Anfragen (Grundstück mit Gemeinde/Kreis/Bundesland, Einzugsgebiet, Karte, genutzte Nummer/Mail, Kampagne, Status, Ergebnis, Bearbeiter, Mailstatus).
- `DashboardTabs.tsx` – Reiter Offen / Nicht zugewiesen / Meine / Alle mit Anzahl Kontakte.
- `IntakeNotices.tsx` – Hinweise auf Prüffälle und nicht verarbeitete Eingänge, Knopf „Erneut verarbeiten“ (Server Action).
- `SortableHeader.tsx` – klickbare Spaltenüberschrift im Dashboard: setzt `?view=…&sort=…&dir=…`, zweiter Klick dreht die Richtung um.
- `icons.tsx` – Linien-Icons aus dem Figma-Entwurf (Pfeile, Lupe, Pin, Häkchen, Warnung, Stift, Spinner).
- `PhoneField.tsx` – Telefon mit Vorwahl-Dropdown (Flagge + Vorwahl, darunter native Länderliste: DE/AT/CH oben, dann alle alphabetisch) und Nummernfeld mit Formatierung beim Tippen. Eingefügte Nummern mit `+…`/`00…` ersetzen den Inhalt und stellen das Land um. Logik in `lib/phone-input.ts`.
- `Field.tsx` – Formular-Bausteine im Planeco-Design: `Field` (Label + Eingabe + Hinweis + Fehler), `Label`, `FieldError`, Klassen `inputBase`/`inputBorder`.
- `MailStatus.tsx` – Versandstatus der Bestätigungsmail (✓ gesendet / ✗ fehlgeschlagen / … ausstehend), Details als Tooltip. Daten vom Eingang.
