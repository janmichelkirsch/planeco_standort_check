# components/dashboard/

Dashboard im Planeco-Design (Vorlage: Figma-Make-Entwurf „Formular im Planeko Design“, Version 3, Route `#dashboard`).
Die Daten lädt der Server (`lib/dashboard-data.ts`, Session-Client mit RLS); die Komponenten bekommen sie als Props.
Interaktive Teile (Menüs, Popups, sofortiges Speichern) sind Client Components und rufen die Server Actions aus `app/admin/actions.ts` auf.

- `ui.tsx` – Bausteine ohne Zustand: `Button`/`buttonClass`, `Select`, `inputClass`, `StatusGlyph`, `StatusBadge`, `ResultBadge`,
  `Avatar` (Farbe nach Position im Team), `UnassignedPill`, `Progress`, `FeedbackLine`, `MailStatusBadge` (Tooltip mit Zeitpunkt/Fehler), `Tag`, `cardClass`, `linkCls`.
- `Popover.tsx` – `Popover` (im Portal, schließt bei Klick daneben, Escape, Scrollen, beim Verstecken der Seite durch `<Activity>`),
  `Menu` (Pfeiltasten, Untermenüs) und `useAnchor()` für Öffnen/Schließen mit Fokus zurück.
- `Shell.tsx` – Kopfzeile: Logo, Bereiche (`NavLinks.tsx`, aktiv nach Pfad), „Eingeloggt als …“, CSV-Export, Abmelden.
- `InboxView.tsx` – Inhalt der Inbox ohne Laden (Seite lädt, lokale Vorschau setzt Beispieldaten ein): Begrüßung, Hinweise, Reiter, Liste.
- `Greeting.tsx` – Datum und Gruß in deutscher Zeit, „N Kontakte ohne Zuständigen · N offene Anfragen bei dir“ als Links in die Reiter.
- `Notices.tsx` – Hinweis-Pills: Prüffälle → Prüfliste; nicht verarbeitete Eingänge + offene Adresssuchen → Popup mit „Alles erneut verarbeiten“.
- `Tabs.tsx` – Reiter Offen / Nicht zugewiesen / Meine / Alle mit Anzahl (koralle, solange jemand nicht zugewiesen ist).
- `EmptyState.tsx` – leere Liste je Reiter bzw. „Noch keine Anfragen“.
- `Feedback.tsx` – `FeedbackProvider`/`useFeedback`: Meldung oben nach einer Aktion (bleibt beim Scrollen sichtbar), schließbar.
- `InboxContext.tsx` – `InboxProvider`/`useInbox` (Ansicht, Sortierung, ich, Team) und `useInboxAction` (Action ausführen, Rückmeldung, Kontakt per `keep`/`open` merken).
- `ContactTable.tsx` – Kontaktliste: Kopf mit Sortier-Links (`SortHeader.tsx`), eine Zeile pro Kontakt; unter 1024 px scrollt sie in sich.
- `ContactRow.tsx` – Zeile (Name, Hinweis-Symbol, „N Anfragen“ + Symbol „automatisch wiedererkannt“, Telefon/Mail, Zuständig, Fortschritt, neueste Anfrage),
  aufklappbar; koralle Leiste ohne Zuständigen. Klicks auf Telefon, Mail und Menü klappen nicht auf.
- `AssigneeMenu.tsx` – genau ein Zuständiger: ohne → „Ich übernehme“ / „Jemand anderem zuweisen“; mit → „Zuständig ändern“ / „Freigeben“. Kein „X“ am Chip.
- `ContactBar.tsx` – im aufgeklappten Kontakt: „Neue Anfragen dieser Person landen automatisch bei …“ und „Name bearbeiten“.
- `RequestCard.tsx` – eine Anfrage: „Anfrage i von n“ mit Zuordnungs-Symbol (neu / automatisch / manuell), Status, Ergebnis, Bearbeiter-Menü;
  Grundstück; eingeklappt „Analytics“ (Herkunft, Bestätigungsmail, Kontaktdaten). Status/Ergebnis/Bearbeiter speichern sofort, bei Fehler springt das Feld zurück.
- `PlotInfo.tsx` – Grundstück: Region, Einzugsgebiet, Zustand der Adresse (nur Ort / nicht gefunden / wird nachgeschlagen / fehlgeschlagen), Karte nur bei genauer Adresse.
- `ReviewView.tsx` – Prüfliste ohne Laden: Rückmeldung aus `?result=`, Erklärung, Fälle, leerer Zustand.
- `ReviewCase.tsx` – ein Prüffall: links die Eingabe, rechts die Kandidaten (Telefon/Mail/Name gleich oder anders, bekannte Nummern/Mails, Verlauf, Zuständig),
  Namenswahl bei abweichendem Namen, „Diesem Kontakt zuordnen“ und „Neuen Kontakt anlegen“. Formulare mit Server Action, ohne JavaScript bedienbar.
- `CampaignInfo.tsx` – Herkunft aus `lib/channel.ts`: Kanal, Kampagne, Klick-ID; ohne Kampagne „über {Host}“ / „direkt aufgerufen“.
