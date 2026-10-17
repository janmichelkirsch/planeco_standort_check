# components/

UI-Komponenten (Client Components).

- `LeadForm.tsx` – das Formular: Grundstücksadresse oben, Kontaktdaten unten. Sendet an `/api/lead`, behält Eingaben bei Fehlern.
- `AddressSearch.tsx` – Suchfeld mit Adressvorschlägen von Photon und Link „Manuell eingeben“. Fällt Photon aus, bleibt die manuelle Eingabe.
- `LoginForm.tsx` – Login-Formular für `/login` (E-Mail, Passwort, Fehlermeldung).
- `LeadsTable.tsx` – Tabelle aller Anfragen im Dashboard. Zeiten in deutscher Zeit, Telefon und E-Mail klickbar, auf dem Handy seitlich scrollbar.
- `SortableHeader.tsx` – klickbare Spaltenüberschrift: setzt `?sort=…&dir=…` in der URL, zweiter Klick dreht die Richtung um.
