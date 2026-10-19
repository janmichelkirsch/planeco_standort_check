# Handover

Laufendes Log für alle, die am Projekt arbeiten (Menschen und Agents). Neueste Einträge oben.

## Änderungslog

### 2026-10-19 – Projekt abgeschlossen
- PR #1 (`feat/dashboard-redesign` inkl. `feat/contact-data-model`) auf `main` gemerged und live. Live-Test: Testanfrage über die Live-URL kam in
  `incoming_submissions` an (`processed`), in `leads` nichts Neues seit dem 17.10. Danach `005_drop_leads.sql` in Supabase ausgeführt – `leads` ist gelöscht.
  Ein Zurückschalten auf Deployments vor dem Merge geht damit nicht mehr (die alte Version braucht `leads`).
- Danach direkt auf `main`: Turbopack-Build-Cache aus (alte Farben live), Vergleichstabelle entfernt, Ring „Rückmeldung“ über bewertete Anfragen, Fußnote entfernt,
  Mail-Umbruch auf der Danke-Seite.
- ROADMAP, Spezifikation und READMEs auf Endstand gebracht; „Offene Punkte“ aufgeräumt (erledigte entfernt, Rest bewusst offen).
  Neu in der ROADMAP: „Nächste Schritte“ in drei Phasen (Go-live Readiness → Dashboard/Analytics → Standortanalyse/Automatisierung), mit Michel abgestimmt.
- **Live:** Formular https://planeco-standort-check-two.vercel.app · Dashboard https://planeco-standort-check-two.vercel.app/admin

### 2026-10-19 – Nach dem Merge: Farben live, Analyse, Mail-Umbruch
- **Gefunden:** Live fehlten alle neuen Dashboard-Farben (`ok`, `warn`, `coral-strong`, `shadow-card` …), lokal waren sie da. Das CSS auf Vercel hatte die neuen Klassen,
  aber ein altes Tailwind-Theme aus `app/globals.css` – der Turbopack-Build-Cache hat eine alte Fassung übernommen. Folge u. a.: Datenqualität ohne Balken und Punkte.
  Behoben mit `experimental.turbopackFileSystemCacheForBuild: false` (`next.config.ts`); Builds rechnen dadurch jedes Mal neu.
- Analyse: Vergleichstabelle „Welche Kanäle und Kampagnen etwas taugen“ entfernt (mit Michel). „Rückmeldung“ rechnet Ring und Prozente nur über bewertete Anfragen,
  passend zur Quote in der Mitte (vorher 100 % in der Mitte, 20 % in der Legende); „Noch kein Ergebnis“ steht getrennt darunter.
- Danke-Seite (Handy): Die Mail-Adresse brach mitten im Wort um (`break-all`); jetzt rutscht sie als Ganzes in die nächste Zeile.

### 2026-10-19 – Dashboard-Redesign abgeschlossen (Branch `feat/dashboard-redesign`, nicht gepusht)
- Umgesetzt nach dem mit Michel abgestimmten Plan (liegt bei ihm, nicht im Repo), Vorlage Figma Make „Formular im Planeko Design“, Version 3.
  Inbox (Begrüßung, Hinweise, Reiter, Kontaktliste mit Zuständig-Menü, Anfragekarte mit sofortigem Speichern), Prüfliste und Analyse im Planeco-Design.
- Bewusste Entscheidungen (mit Michel): genau ein Zuständiger pro Kontakt + abweichender Bearbeiter pro Anfrage (kein „Team“ aus dem Entwurf);
  „automatisch zugeordnet“ (Person wiedererkannt) getrennt von „neue Anfragen landen bei …“; kein Speichern-Knopf für Status/Ergebnis/Bearbeiter;
  „Analytics“ bleibt der Name des eingeklappten Bereichs; „Meiste Anfragen“ statt „Stärkste Plattform“; nur Desktop (unter 1024 px scrollt die Tabelle in sich);
  Hinweis „Login ohne Team-Mitglied“ entfällt; CSV-Export bleibt serverseitig.
- Selbst entschieden: kein „X“ am Zuständigen-Chip (Freigeben nur im Menü); „Name bearbeiten“ behält den Speichern-Knopf; Prüfliste zeigt die bekannten
  Nummern/Mails der Kandidaten; Meldungen bleiben beim Scrollen sichtbar; Menüs öffnen am unteren Rand nach oben.
- Geprüft: Lint, 166 Tests, Build; Optik und Bedienung lokal mit Beispieldaten in einer temporären Vorschau (1440 px und 1024 px), inkl. Fehlerfällen ohne Datenbank.
  Die Vorschau ist wieder gelöscht.
- **Nicht geprüft:** alles gegen Supabase – Übernehmen/Zuweisen/Freigeben, Speichern von Status/Ergebnis/Bearbeiter, Namen ändern, Zuordnen in der Prüfliste,
  „Erneut verarbeiten“, Laden der Kandidaten-Kontaktdaten, Analyse mit echten Daten. Nächster Schritt: Branch pushen und auf der Vercel-Vorschau testen (gleiche DB wie Live).
- **Für die Notizen zur Abgabe:** Damit die Analyse Kampagnennamen zeigt, müssen die Anzeigen UTM-Parameter mitgeben – Meta unter „URL-Parameter“
  (z. B. `utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}`), Google Ads im „Suffix der finalen URL“
  (z. B. `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}`; Google setzt nur die ID ein). Ohne UTM zählt der Klick über `gclid`/`fbclid`
  trotzdem zum richtigen Kanal („Kampagne unbekannt“). Ohne Werbekosten gibt es keine Kosten pro Anfrage, „taugt etwas“ = Quote qualifiziert.

### 2026-10-19 – Fix: Kopfzeile bei 1024 px
- „Standort-Check“ und „Eingeloggt als …“ brachen bei 1024 px um; jetzt ohne Umbruch.

### 2026-10-19 – Dashboard-Redesign, Schritt 8: Analyse-Diagramme
- Unter der Vergleichstabelle: „Anfragen im Verlauf“ (gesamt / nach Kanal / nach Kampagne, alle / nur qualifizierte, täglich / kumuliert, Linien ausblendbar),
  „Rückmeldung“ (Ring) und „Datenqualität“ (Adresse mit allen fünf Zuständen, Bestätigungsmail, Herkunft). Sparklines in den Kacheln.
- SVG ohne Bibliothek aus dem Figma-Entwurf übernommen (`components/dashboard/analyse/charts.tsx`), dazu eine unsichtbare Tabelle für Screenreader.
- Tests: 166. Lokal mit Beispieldaten geprüft (1440 px).

### 2026-10-19 – Dashboard-Redesign, Schritt 7: Analyse
- Neue Seite `/admin/analyse` (Case Pflicht 6), in der Kopfzeile als „Analyse“. Filter: Zeitraum (7/14/30 Tage, Gesamt = Standard, Von/Bis), Kanal, Kampagne.
- Kacheln: Anfragen (± Vorperiode, „N in Prüfung“), Qualifiziert (Quote der bewerteten), „Meiste Anfragen“ (umbenannt von „Stärkste Plattform“, weil es die Menge misst),
  Kampagnen mit Namen (+ N ohne Kampagne).
- **Kern:** Vergleichstabelle Kanal → Kampagnen mit Anfragen, mit Ergebnis, qualifiziert, nicht qualifiziert, nicht erreicht und Quote (qualifiziert ÷ mit Ergebnis);
  unter 5 bewerteten grau mit „wenig Daten“. Fußnote: ohne Werbekosten keine Kosten pro Anfrage.
- `lib/analyse.ts`: Tage nach Berliner Zeit (auch über die Zeitumstellung getestet), Kanal über `lib/channel.ts` (Google-/Meta-Klick ohne UTM richtig zugeordnet).
  Gezählt wird pro Anfrage; Prüffälle und nicht verarbeitete Eingänge noch nicht.
- Tests: 165. Lokal mit Beispieldaten geprüft. **Nicht geprüft:** gegen Supabase. Diagramme folgen (optional) in Schritt 8.

### 2026-10-19 – Dashboard-Redesign, Schritt 6: Prüfliste
- `/admin/review` im Planeco-Design (`components/dashboard/ReviewView.tsx`, `ReviewCase.tsx`): links die neue Eingabe mit Herkunft, rechts die Kandidaten mit
  „Telefon/Mail/Name gleich/anders“, abweichende Werte hervorgehoben, Verlauf, Zuständig; Namenswahl nur bei abweichendem Namen.
- Neu: Die Kandidaten zeigen ihre bekannten Telefonnummern und Mails (aus `contact_methods`, wie im Entwurf), damit man die Abweichung sieht.
- Gleichzeitig bearbeitet (`P0409`): gelbe Meldung „Diese Anfrage wurde gerade schon von jemand anderem bearbeitet. Die Liste ist aktualisiert.“ (mit Michel).
- Herkunft der Prüffälle über `lib/channel.ts` (gleich wie an der Anfrage). Formulare bleiben Server Actions mit `?result=`. Entfernt: `ReviewCaseCard.tsx`.
- Tests: 156. Optik lokal geprüft (ein, zwei, kein Kandidat; Meldungen). **Nicht geprüft:** Zuordnen gegen Supabase.

### 2026-10-19 – Dashboard-Redesign, Schritt 5: Anfragekarte
- `components/dashboard/RequestCard.tsx`: Anfrage im Planeco-Design. **Kein Speichern-Knopf** mehr (mit Michel): Status, Ergebnis und Bearbeiter speichern beim Ändern;
  „Speichert … / Gespeichert / Nicht gespeichert“ in der Karte, bei Fehler springt das Feld zurück und oben erscheint eine Meldung.
- Grundstück (`PlotInfo.tsx`) mit allen fünf Adress-Zuständen; „nur Ort ermittelt“ ohne Kartenlink (keine Koordinaten gespeichert), „Nachschlagen fehlgeschlagen“ mit Hinweis auf „Erneut verarbeiten“.
- „Analytics“ (eingeklappt, Name mit Michel so belassen): Herkunft, Bestätigungsmail (Tooltip Zeitpunkt/Grund), Kontaktdaten formatiert, „eingegeben als …“.
- `lib/channel.ts`: Kanal auch ohne UTM aus `gclid`/`fbclid` (Google-Autotagging), sonst Verweis/Direkt; „Kampagne unbekannt“ bei Klick ohne `utm_campaign`.
- Entfernt: `SubmissionCard.tsx`, `DashboardParts.tsx`, `MailStatus.tsx`, die FormData-Actions `claimContact`/`updateContact`/`updateSubmission`, `returnUrl`, `parse*Form` samt Tests.
  Das Dashboard braucht damit JavaScript (internes Werkzeug, mit Michel entschieden).
- Tests: 155. Lokal geprüft: Fehlerfall beim Speichern, Adress-Zustände, Google-Klick ohne UTM. **Nicht geprüft:** erfolgreiches Speichern gegen Supabase.

### 2026-10-19 – Dashboard-Redesign, Schritt 4: Kontaktliste
- Neue Liste im Planeco-Design (`components/dashboard/ContactTable.tsx`, `ContactRow.tsx`): Spalten Kontakt, Erreichbar (Telefon formatiert + Mail der neuesten Anfrage),
  Zuständig, Fortschritt (Symbol pro Anfrage), Neueste Anfrage; Sortier-Links wie bisher. Warn-Symbol bei Mailfehler oder Adresse nicht gefunden/nicht nachschlagbar.
- Zuständig-Menü in der Zeile (mit Michel): genau eine Person; ohne Zuständigen „Ich übernehme“ (koralle) oder zuweisen, sonst ändern oder freigeben.
  Kein „X“ am Chip (versehentliches Freigeben). Rückmeldung mit Namen, danach bleibt der Kontakt per `keep` sichtbar.
- „Automatisch zugeordnet“ getrennt: Ketten-Symbol in der Zeile = Person wiedererkannt; im aufgeklappten Kontakt „Neue Anfragen dieser Person landen automatisch bei …“.
  „Name bearbeiten“ behält den Speichern-Knopf (Texteingabe).
- Die Anfragen im aufgeklappten Kontakt sind noch die alten Karten (folgt in Schritt 5). Entfernt: `ContactList.tsx`, `ContactActions.tsx`, `SortableHeader.tsx`.
- **Gefunden und behoben:** Konstanten aus `"use client"`-Dateien kommen auf dem Server als Funktion an (Spalten-Raster fehlte im Kopf) → nach `ui.tsx`.
  Menü in den letzten Zeilen ragte aus dem Bildschirm → öffnet dann nach oben. Meldung oben war beim Arbeiten weiter unten nicht sichtbar → bleibt beim Scrollen stehen.
- Optik und Menüs lokal geprüft (1440 px, Fehlerfall ohne Datenbank). **Nicht geprüft:** Übernehmen/Zuweisen gegen Supabase.

### 2026-10-19 – Dashboard-Redesign, Schritt 3: Actions mit Rückgabewert
- Neue Server Actions für Client Components (`app/admin/actions.ts`): `claimContactAction`, `setContactOwnerAction`, `renameContactAction`, `saveSubmissionAction`.
  Gleiche Datenbankfunktionen wie bisher, aber Ergebnis statt Redirect, danach `refresh()`. Eingaben werden geprüft (`lib/dashboard-forms.ts`).
- `?keep=<Kontakt>&open=<Kontakt>`: Der gerade bearbeitete Kontakt bleibt sichtbar und aufgeklappt, auch wenn er nicht mehr zum Reiter passt (wie im Figma-Entwurf).
  Reiterwechsel und Sortieren erzeugen URLs ohne `keep`.
- `plotState` (fünf Adress-Zustände) und `hasIssue` (Warn-Symbol) für die neue Liste. Noch nicht in der Oberfläche; die alten Formulare laufen weiter.
- Tests: 152. **Nicht geprüft:** gegen Supabase.

### 2026-10-19 – Dashboard-Redesign, Schritt 2: Rahmen
- `app/admin/layout.tsx`: Kopfzeile im Planeco-Design für alle `/admin`-Seiten (Logo, Inbox, „Eingeloggt als {Name aus team_members}“, CSV, Abmelden).
  Login und Team einmal pro Anfrage über `lib/sales-context.ts` (React `cache`).
- Begrüßung mit Datum/Gruß in Berliner Zeit und Links „N Kontakte ohne Zuständigen“ / „N offene Anfragen bei dir“ (`countMyOpen`).
- Hinweis-Pills: „N Anfragen warten auf Prüfung“ → Prüfliste; „N nicht verarbeitet“ (Eingänge + Adresssuchen) → Popup mit Zusammenfassung und
  „Alles erneut verarbeiten“ (`reprocessIntakesAction`, gibt Ergebnis zurück). Reiter und leere Zustände neu. Die Kontaktliste ist noch die alte.
- Entfernt: `IntakeNotices.tsx`, `DashboardTabs.tsx`, die alte Action `reprocessIntakes`. Hinweis „Login ohne Team-Mitglied“ entfällt (mit Michel), wird nur geloggt.
- **Gefunden und behoben:** Popover schloss sich im Dev-Modus sofort (StrictMode baut Effekte ab und auf); Schließen beim Verstecken der Seite jetzt verzögert.
- Tests: 133. Optik lokal mit Beispieldaten (1440 px). **Nicht geprüft:** gegen Supabase.

### 2026-10-19 – Dashboard-Redesign, Schritt 1: Grundlagen
- Branch `feat/dashboard-redesign` (von `feat/contact-data-model`).
- `app/globals.css`: Dashboard-Farben aus dem Figma-Entwurf (`coral-soft/strong/ink`, `ok`, `warn`, `danger-soft/line`, `shadow-card`), Formular unverändert.
- `components/icons.tsx`: 20 Icons fürs Dashboard ergänzt. `components/dashboard/ui.tsx` (Knöpfe, Badges, Avatar, Fortschritt, Meldungen, Mailstatus),
  `components/dashboard/Popover.tsx` (Popover, Menü mit Tastatur). `lib/format.ts`: großgeschriebene Labels für Status/Ergebnis.
- Noch nicht eingebunden; das Dashboard sieht unverändert aus. Optik lokal in einer Vorschau mit Beispieldaten geprüft (nicht im Repo).
- **Erkenntnis:** Tailwind 4 erzeugt keine Klassen für Dateien, die Git ignoriert (auch `.git/info/exclude`). Die lokale Vorschau nutzt daher nur Komponenten aus `components/`.

### 2026-10-17 – Schritt 9 vorbereitet (nicht ausgeführt)
- `supabase/005_drop_leads.sql` liegt bereit, **nicht ausgeführt**. Kein Code liest oder schreibt `leads` mehr (geprüft per Suche).
- `main` hat sich seit dem Abzweigen nicht bewegt, der Merge geht ohne Konflikte (Fast-Forward).
- Offen bis zur Prüfung durch Michel: Merge auf `main` (= Live-Deployment), danach Live-Test, danach `005`.

### 2026-10-17 – Schritt 5: Geocoding manueller Adressen
- `lib/geocode.ts`: Nach dem Anlegen einer Anfrage mit manueller Adresse (`geocode_status = pending`) Photon-Suche „Straße Nr, PLZ Ort“, Timeout 5 s.
  Läuft nach `process_intake` (in `after()`), nach dem Zuordnen in der Prüfliste und bei „Erneut verarbeiten“ (dann alle `pending`/`failed`, max. 200).
- Treffer-Regel (`lib/geocode-match.ts`): nur gleiche PLZ. Gleiche Straße → Gemeinde/Kreis/Bundesland **und** Koordinaten. Nur andere Straße derselben PLZ
  oder Rückfall-Suche „PLZ Ort“ → nur Gemeinde/Kreis/Bundesland, **keine Koordinaten** (Dashboard: „nur Ort ermittelt, Adresse nicht gefunden“).
  Nichts → `not_found`. Photon-Fehler → `failed`, Hinweis im Dashboard mit „Erneut verarbeiten“.
- Live gegen Photon geprüft mit den Case-Adressen: „Hauptstraße 14, 01067 Dresden“ (echte PLZ wäre 01097) → nur Ort Dresden/Sachsen;
  „Osterstraße 88, 22765 Hamburg“ (echte PLZ 20259) → nur Ort Hamburg; „Am Mühlenteich 7, 23627 Groß Grönau“ → nur Ort (Straße fehlt in OSM);
  „Weidengrund 48, 33154 Salzkotten“ → genau; Fantasieadresse → nicht gefunden.
- **Gefunden und behoben (bestand schon vorher):** Photon liefert für Hamburg und Berlin kein Bundesland. Auch Vorschläge aus dem Formular hätten dort
  „Gebiet unbekannt“ gezeigt. `lib/photon.ts` ergänzt das Bundesland bei Stadtstaaten (Hamburg, Berlin, Bremen, Bremerhaven).
  **Hinweis:** Die Case-Beispiele haben teils PLZ, die nicht zur Straße passen – im Interview erwähnenswert.
- Tests: 127. **Nicht geprüft:** gegen Supabase (Vorschau).

### 2026-10-17 – Schritt 8: Bearbeiten im Dashboard
- Pro Kontakt (aufgeklappt): „Übernehmen“, solange niemand zuständig ist (`claim_contact`; wer verliert, sieht „Jemand anderes war schneller“).
  „Kontakt bearbeiten“: Zuständigen ändern oder freigeben (`set_contact_owner`), Namen korrigieren (`update_contact_name`).
- Pro Anfrage: Status (offen/kontaktiert/abgeschlossen), Ergebnis (noch offen/qualifiziert/nicht qualifiziert/nicht erreicht),
  Bearbeiter („wie Zuständig“ = kein Override). Gespeichert werden nur geänderte Felder.
- Alles als Server Actions mit dem Session-Client über die Funktionen aus `004` (Team-Member-Prüfung in der Datenbank). Ohne JavaScript bedienbar;
  nach dem Speichern zurück in dieselbe Ansicht, Kontakt aufgeklappt, Rückmeldung oben. Rücksprung-URL nur aus geprüften Werten (kein offener Redirect).
- Bewusst: Wird die letzte offene Anfrage abgeschlossen, verschwindet der Kontakt aus „Offen“ (Rückmeldung „Gespeichert.“ bleibt sichtbar).
- `ContactList.tsx` aufgeteilt in `ContactActions`, `SubmissionCard`, `DashboardParts`.
- Tests: 114 (neu: Formular-Prüfung, Rücksprung-URL). Optik lokal mit Beispieldaten geprüft. **Nicht geprüft:** Speichern gegen Supabase (Vorschau).

### 2026-10-17 – Schritt 7: Prüfliste
- `/admin/review`: Eingänge mit `needs_review`. Pro Fall die Eingabe (Name, Telefon, Mail, Grundstück, Kampagne) und die möglichen Kontakte, bei jedem Aufruf
  neu berechnet (`intake_candidates`), mit „Telefon/Mail/Name gleich/anders“, Zuständigem und bisherigen Anfragen (Anzahl, letzte Adresse).
- Entscheidungen mit Michel: Zuordnen nur an vorgeschlagene Kandidaten (freie Suche → Backlog). Bei abweichendem Namen „behalten“ (Standard) oder „übernehmen“;
  der eingegebene Name bleibt an der Anfrage.
- Server Action `resolveReview` → `resolve_intake_review` mit dem Session-Client (Team-Member-Prüfung, Sperre, kein `reviewed_by`).
  Rückmeldung per `?result=attached|created|conflict|forbidden|invalid|error`, ohne JavaScript.
- Dashboard-Hinweis „N Anfragen warten auf Prüfung“ hat jetzt den Knopf „Jetzt prüfen“.
- Tests: 102. Optik lokal mit Beispieldaten geprüft (Fall Anna Kirsch); behoben: Abstände in der Namenswahl.
- **Nicht geprüft:** echtes Zuordnen gegen Supabase (folgt auf der Vorschau). Geocoding nach dem Zuordnen folgt mit Schritt 5.

### 2026-10-17 – Schritt 6: Dashboard auf neues Datenmodell
- `/admin` zeigt einen Eintrag pro Kontakt statt pro Anfrage: Name, Zuständig („Nicht zugewiesen“ / „Emily · auch Björn“), Fortschritt „x von y abgeschlossen“,
  neueste Anfrage, Hinweis „automatisch zugeordnet“. Aufklappbar (`<details>`, ohne JS) zu den Anfragen mit Grundstück, Gemeinde/Kreis/Bundesland,
  „im Einzugsgebiet“, OSM-Kartenlink, genutzter Nummer/Mail, eingegebenem Namen (falls abweichend), Kampagne, Status, Ergebnis, Bearbeiter, Mailstatus.
- Reiter Offen (Standard, mit Michel entschieden) / Nicht zugewiesen / Meine / Alle; Sortierung neueste Anfrage / Name / Zuständig. Gruppieren, Filtern, Sortieren
  passiert in TS (`lib/dashboard.ts`), weil Kontakte aus mehreren Anfragen bestehen; bei vielen tausend Anfragen wäre eine View/RPC besser.
- Hinweise oben: Prüffälle (Link zur Prüfliste folgt mit Schritt 7) und nicht verarbeitete Eingänge (`failed` oder > 5 Min. `received`) mit „Erneut verarbeiten“.
- CSV-Export neu: eine Zeile pro Anfrage (37 Spalten inkl. Tracking, Einzugsgebiet, Zuständig/Bearbeiter, Mail), plus Eingänge in Prüfung / nicht verarbeitet aus dem Payload.
- Entfernt: `lib/leads.ts`, `components/LeadsTable.tsx` (Tabelle `leads` bleibt bis zum Merge, Live braucht sie).
- Einzugsgebiet: `lib/service-area.ts`, alle 16 Bundesländer (mit Michel entschieden, Hinweis wird angezeigt).
- Tests: 91. Optik lokal mit Beispieldaten geprüft (Desktop 800 px, Mobile 375 px, kein seitliches Scrollen); behoben: „Hamburg · Hamburg“ doppelt.
- **Nicht geprüft:** mit echten Daten. Die Abfrage nutzt PostgREST-Einbettung über Constraint-Namen (`contact_methods!submissions_email_same_contact_fk`);
  ob Supabase das genau so auflöst, zeigt erst die Vorschau.

### 2026-10-17 – Vorschau-Test des neuen Datenmodells
- Vercel-Projekt war pausiert (Live 503 `DEPLOYMENT_PAUSED`, Deployments „blocked“); von Michel fortgesetzt. Branch-Build per leerem Commit angestoßen.
- Vorschau: `planeco-standort-check-git-feat-contact-data-model-michel-5238.vercel.app` (hinter Vercel-Login / Deployment Protection).
- Drei Anfragen über die Vorschau, Ergebnis in Supabase wie erwartet: 1. `processed` / `new_contact_created`, 2. `processed` / `auto_matched` (selber Kontakt),
  3. gleiche Nummer, anderer Name → `needs_review` ohne Submission. Mail bei allen drei `sent`; `utm_source=test`, `utm_campaign=branchtest` an den Submissions.
  Damit sind die Preview-Variablen für Supabase und Brevo gesetzt.
- **Falle:** Die erste Testrunde lief versehentlich über die Live-URL (alter Code → `leads`). Live und Vorschau sehen gleich aus;
  erkennbar am neuen Telefonfeld mit Flagge.
- **Noch nicht getestet:** manuelle Adresse (`geocode_status = pending`, Nachschlagen folgt mit Schritt 5), Doppelklick/Retry auf der Vorschau.

### 2026-10-17 – Schritt 4: API auf neues Datenmodell
- `/api/lead` schreibt nicht mehr in `leads`, sondern in `incoming_submissions` (`lib/intake.ts`, `lib/intake-row.ts`).
  Ablauf: prüfen (400/422) → normalisieren → Eingang speichern → Antwort → per `after()` Bestätigungsmail und `process_intake`, unabhängig voneinander.
- Gleiche `client_request_id`: kein zweiter Eingang, keine zweite Mail, Antwort `200` mit derselben ID (neu: `201`). `process_intake` läuft trotzdem
  erneut an (no-op, falls schon verarbeitet; holt einen abgebrochenen Eingang nach).
- Fehlt die ID (Aufruf nicht über unser Formular), erzeugt der Server eine; dann gibt es keine Idempotenz, aber keinen Verlust.
- Mailstatus steht jetzt an `incoming_submissions.confirmation_*` (`lib/mail/send-confirmation.ts`).
- **Folge auf dem Branch:** Das alte Dashboard (liest `leads`) zeigt neue Anfragen nicht mehr. Erst Schritt 6 stellt es um. Live (`main`) ist nicht betroffen.

### 2026-10-17 – Schritt 3: Formular (Telefon, Tracking, clientRequestId)
- Telefon: `components/PhoneField.tsx` + `lib/phone-input.ts`. Dropdown mit Flagge und Vorwahl (DE, AT, CH oben, dann alle Länder alphabetisch,
  deutsche Namen), Nummer ohne Vorwahl, Formatierung beim Tippen („0170 5551234“). Rücktaste hinter einem Leerzeichen löscht die Ziffer davor;
  Cursor bleibt hinter derselben Ziffer. `+…`/`00…` stellt das Land um und wird national geschrieben, sobald gültig; Einfügen ersetzt den Inhalt.
  Entscheidung mit Michel: Vorwahl steht nur im Dropdown. Die führende 0 bleibt im Feld (üblich, `libphonenumber-js` versteht beides).
- Tracking: `lib/tracking.ts` liest UTM, `gclid`, `fbclid`, Landingpage, Referrer beim Laden und merkt sie in `sessionStorage`
  (Neuladen ohne Parameter behält die Kampagne, neuer Kampagnen-Klick ersetzt sie). Wird beim Absenden angehängt.
- `clientRequestId`: pro Absenden neu, bei unverändertem erneutem Versuch (z. B. nach Netzfehler) dieselbe. Im Schema weiter optional;
  die API (Schritt 4) erzeugt bei fehlender ID eine eigene.
- Photon: `county` und `municipality` (= Photon `city`) werden aus dem Vorschlag übernommen, bei manueller Änderung verworfen.
- Tests: 65 (neu: Telefonfeld, Tracking, Photon-Mapping). Im Browser geprüft (Desktop 800 px, Mobile 375 px): Formatierung, Löschen, Einfügen von
  AT/CH/DE-Nummern, Fehler „Bitte prüfen Sie die Telefonnummer.“ mit Fokus, nichts gesendet; gesendete Daten enthalten Land, Tracking, Kreis/Gemeinde,
  gleiche ID beim zweiten Versuch. Speichern lokal mangels Supabase-Keys mit 500 (erwartet), Server-Prüfung hat die Felder akzeptiert.
- **Aufgefallen:** Für die Case-Adresse „Am Mühlenteich 7, Groß Grönau“ schlägt Photon zuerst „Am Mühlenteich 7, 31028 Gronau (Leine)“ vor, also einen
  falschen Ort. Die Straße gibt es in Groß Grönau in OSM offenbar nicht. Nutzer müssen dann „Manuell eingeben“. Kandidat für die Notizen.
- **Nicht geprüft:** echtes iPhone/Android (native Länderliste), Screenreader.

### 2026-10-17 – Schritt 2: Normalisierung, Schema, Vitest
- `lib/normalize.ts`: `normalizePhone` (E.164 über `libphonenumber-js`, Standardland DE, `+…`/`00…` werden erkannt) und `normalizeEmail`.
- `lib/lead-schema.ts`: Telefon wird jetzt per `libphonenumber-js` gegen das Land geprüft (statt Regex); neue Felder `phoneCountry` (Standard DE),
  `clientRequestId` (vorerst optional), `county`, `municipality`, 9 Tracking-Felder. Tracking kann eine Anfrage nie scheitern lassen
  (zu lang → auf 500 Zeichen gekürzt, falscher Typ/leer → `null`).
- Vitest 4.1 (`npm test`, nur `lib/**/*.test.ts`, Umgebung node): 31 Tests, alle grün, inkl. der fünf Case-Telefonnummern.
  Vitest 5 hätte `@types/node` ≥ 22 verlangt; das Projekt hat 20, daher Vitest 4.1 statt Typen-Upgrade.
- `CLAUDE.md`: vor jedem Commit zusätzlich `npm test`.
- `npm audit`: 5 „high“ in `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` (nur Dev-Werkzeug, nicht von dieser Änderung).
  `npm audit fix --force` würde ESLint brechen, daher nicht ausgeführt.
- **Nicht im Browser geprüft:** Das Formular nutzt das neue Schema bereits (gleiche Fehlermeldung, nur genauere Prüfung). Sichtbar getestet wird mit Schritt 3.
- `libphonenumber-js` landet im Client-Bundle (Formular-Prüfung), Standard-Metadaten („min“).

### 2026-10-17 – SQL 004: Datenmodell Kontakt ↔ Anfrage
- `supabase/004_contact_model.sql`: Tabellen, Trigger, Funktionen und Rechte nach Spezifikation v3.
  **In Supabase ausgeführt** (2026-10-17, ohne Fehler); `team_members`: Emily, Björn, Michel.
- Am Code entschieden: Fehlercodes `P0401` (kein Team Member), `P0404`, `P0409` (schon bearbeitet / Konflikt), `P0422` für die UI;
  `normalized_phone` per Check auf E.164; `mark_intake_failed` zählt Versuche (ein Fehler in `process_intake` rollt dessen Zähler zurück);
  zusätzlich `set_contact_owner` (Owner wechseln/freigeben); `completed_at` bleibt beim erneuten Setzen von `completed` erhalten.
- `supabase/tests/run.sh`: lokale Wegwerf-Datenbank mit Supabase-Stub, 31 SQL-Fälle + 2 Gleichzeitigkeits-Tests, **alle grün**.
  Gegenprobe ohne Advisory Lock erzeugt zwei Kontakte für dieselbe Person, mit Lock einen.
- **Nicht getestet:** gegen das echte Supabase (Stub statt echter `auth`-Schema, Postgres 18 lokal statt Supabase-Version).

### 2026-10-17 – Spezifikation Datenmodell v3
- `docs/spezifikation_v3.md` auf Branch `feat/contact-data-model`: fünf Tabellen (`team_members`, `contacts`, `contact_methods`,
  `incoming_submissions`, `submissions`), konservatives Matching mit Prüfliste, kontaktorientiertes Dashboard. Noch **nichts umgesetzt**.
- Entscheidungen mit Michel gegenüber v2: Mailstatus am Eingang; Tracking (5 × UTM, gclid, fbclid, Landingpage, Referrer) und `outcome`
  an der Submission; Gemeinde/Kreis + Geocoding manueller Adressen; Einzugsgebiet = alle Bundesländer (Liste im Code);
  Prüffälle nur in `incoming_submissions`, aber Hinweis im Dashboard und im Export; kein Worker, sondern `after()` + „Erneut verarbeiten“;
  Advisory Lock gegen doppelte Kontakte; Telefon-Dropdown mit `libphonenumber-js`; alte `leads`-Daten werden nicht übernommen.
- Am Code entschieden: `text` + `check` statt Enums, kein Status `processing`, kein `country_code`, Methoden-IDs Pflicht,
  kein `is_primary`/`is_active`, Matching als SQL-Funktion (Supabase-JS kann keine Transaktionen).
- **Achtung:** Vercel-Vorschau und Live nutzen dieselbe Supabase-DB. Migrationen bis zum Merge nur additiv, `leads` bleibt bis dahin.

### 2026-10-17 – Mails im Planeco-Design
- `lib/mail/layout.ts`: gemeinsamer Rahmen nach Planecos echter Mail-Signatur (Arial-Text, „Liebe Grüße,“, Name groß, Rolle klein,
  Telefon, grün unterstrichene Website, Logo, graue Fußzeile mit Firmendaten). Die Bestätigungsmail nutzt ihn.
- Entscheidungen mit Michel: Team-Signatur „Ihr Planeco-Team / Standort-Check“ statt einer echten Person; keine E-Mail-Zeile
  (es gibt keine echte Adresse, Antworten gehen an den Absender); Telefon `+49 40 66969 123` ist **fiktiv** (BNetzA-Block für Film/Fiktion,
  damit niemand Echtes angerufen wird); ganz unten „Demo im Rahmen einer Case Study“.
- Logo per absoluter URL (Mailprogramme laden keine Anhänge-Pfade): `MAIL_ASSET_BASE_URL` oder automatisch `VERCEL_PROJECT_PRODUCTION_URL`.
- Absendername neu: „Planeco Standort-Check (Demo)“ (`.env.example`; **in Vercel von Hand zu ändern**).
- Im Browser geprüft (gerenderte HTML-Vorschau mit Logo, HTML-Escaping im Namen). Noch **nicht** als echte Mail getestet.
- **Aufgefallen:** Vercel-Deployment antwortete am 2026-10-17 mit `503 DEPLOYMENT_PAUSED`. Solange es pausiert ist,
  erscheint das Logo in Mails als defektes Bild, und die App ist nicht erreichbar.

### 2026-10-17 – Bestätigungsmail live getestet
- Anfrage über das neue Formular → Mail kam im **Gmail-Posteingang** an (nicht Spam), Dashboard zeigt „✓ gesendet“.
- Die ältere Testanfrage zeigt „ausstehend“: Sie stammt von vor der Mail-Funktion und hat den Default `pending` bekommen.
- Gmail blendet „Unsubscribe“ ein (List-Unsubscribe von Brevo). Bei einer Bestätigungsmail unnötig, aber harmlos.
- Echtes Dubletten-Beispiel entstanden: gleiche Telefonnummer und Adresse, aber andere E-Mail und anderer Name
  („Jan Michel Kirsch“ / „Michel Kirsch“). Guter Testfall für das Matching im neuen Datenmodell.

### 2026-10-17 – Bestätigungsmail
- `lib/mail/`: Brevo-Client (Timeout 10 s), Vorlage (HTML + Text, HTML-Escaping), `sendConfirmation()`.
- `/api/lead` speichert zuerst, antwortet, und verschickt die Mail danach per `after()`. Mailfehler ändern die Antwort nie.
- `supabase/003_confirmation_mail.sql`: `confirmation_status` (`pending`/`sent`/`failed`), `confirmation_sent_at`, `confirmation_error`.
- Dashboard: Spalte „Mail“ (sortierbar, Grund als Tooltip). CSV: Status, Zeitpunkt, Fehler.
- Absender: `michelkirsch@icloud.com` (in Brevo verifiziert). Brevo-API-Key mit Rechten **nur** für Transactional Email.

### 2026-10-17 – Formular im Planeco-Design
- Quelle: Figma-Make-Export „Formular im Planeko Design“ (lag unter `~/Downloads`, nicht im Repo). Übernommen: Tokens, Poppins, Icons, `Field`, Mobile-/Desktop-Layout, Texte, Logo, Bild.
  Nicht übernommen: Vorschau-Leiste/Handy-Rahmen, Demo-Adressliste, simuliertes Absenden.
- `lib/use-lead-form.ts`: gemeinsamer Zustand für beide Varianten, Prüfung pro Schritt mit dem zod-Schema, Fokus auf den ersten Fehler.
- Schema: deutsche Meldungen aus dem Design, **Telefon Pflicht**, PLZ genau 5 Ziffern. API liefert `fieldErrors` als Objekt pro Feld.
- Entscheidungen mit Michel: Straße und Hausnummer getrennt; nach Auswahl eines Vorschlags bleiben die Adressfelder bearbeitbar (statt Karte im Design);
  Datenschutz-Link vorerst auf planecobuilding.de; Unsplash-Bild lokal abgelegt; Poppins über `next/font` (keine Google-Anfrage, DSGVO).
- Gefunden und behoben: Such-Icon/Spinner rutschten bei offener Vorschlagsliste unter das Feld (auch im Figma-Code);
  Ergänzen der Hausnummer verwarf Bundesland/Koordinaten; Sendefehler auf Mobile lag außerhalb des sichtbaren Bereichs.
- Im Browser geprüft (Produktions-Build lokal, 390 px und 1440 px): Schritt-Prüfung, Vorschlag ohne Hausnummer, manuelle Eingabe mit Umlauten,
  Sendefehler ohne DB, Wechsel Desktop ↔ Mobile ohne Datenverlust. **Nicht geprüft:** echtes Speichern über das neue Formular (lokal keine Supabase-Keys).

### 2026-10-17 – Dashboard live getestet
- Live mit Testnutzer geprüft: Login, Tabelle (deutsche Zeit korrekt), Sortierung, CSV-Export, Abmelden + Umleitung.
- Selbstregistrierung in Supabase deaktiviert, `002_dashboard_read.sql` ausgeführt, `SUPABASE_PUBLISHABLE_KEY` in Vercel (Production + Preview).

### 2026-10-17 – Speed-Dashboard
- `/login` (Server Action, Supabase Auth), `/admin` (Tabelle, Sortierung über `?sort=&dir=`), `/admin/export` (CSV).
- Schutz in drei Schichten: `proxy.ts` (Umleitung), `lib/auth.ts` (Prüfung beim Laden), RLS-Policy in der DB.
- Dashboard liest mit dem **Publishable Key + Session** (RLS greift), nicht mit dem Secret Key.
- Neue Env-Variable `SUPABASE_PUBLISHABLE_KEY` (ohne `NEXT_PUBLIC_`, wird nur serverseitig genutzt).
- `lib/supabase-server.ts` → `lib/supabase/admin.ts` verschoben.

### 2026-10-17 – Durchstich live
- Deployt auf Vercel: **https://planeco-standort-check-two.vercel.app** (Auto-Deploy bei Push auf `main`).
- Env-Variablen in Vercel: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (sensitive).
- End-to-End getestet: Anfrage vom Handy kam in `leads` an. Live-API antwortet auf kaputtes JSON korrekt mit 400.

### 2026-10-17 – Supabase-Rechte
- Supabase-Projekt `planeco-case` angelegt (Region **London, eu-west-2**), „Automatically expose new tables“ ist **aus**.
- `001_leads.sql`: `grant … to service_role` ergänzt, sonst hätte auch der Server keine Rechte auf die Tabelle.

### 2026-10-17 – Speed-MVP
- Next.js 16 (App Router, Tailwind) aufgesetzt, Paketname `planeco-standort-check`.
- `supabase/001_leads.sql`: flache Tabelle `leads`, RLS aktiv ohne Policies (nur der Server schreibt).
- `lib/photon.ts`: Adresssuche über Photon, nur DE, nur Häuser und Straßen, Ortsteil im Label.
- `lib/lead-schema.ts`: zod-Schema, gemeinsam für Formular und Server.
- `app/api/lead/route.ts`: POST prüft (400/422), speichert (201) oder loggt Fehler (500).
- `components/LeadForm.tsx`, `components/AddressSearch.tsx`: mobiles Formular, Adresse oben, Kontakt unten.
- Wird eine aus Photon übernommene Adresse nachträglich geändert, gilt sie als `manual`, und Koordinaten/Bundesland werden verworfen.
- Lokal getestet: Suche, Übernahme in Felder, Validierungsfehler, Fehlerfall ohne Supabase-Keys.

## Offene Punkte / Probleme

Bewusst offen beim Projektabschluss (19.10.2026). Nach Thema, wichtigste zuerst.

**Vor einem echten Livegang**
- **Datenbank-Region London statt Frankfurt.** Region lässt sich bei Supabase nicht umstellen; Umzug = neues Projekt + Export/Import + neue Keys in Vercel.
- **Zustellbarkeit der Mails:** Absender ist eine Freemail-Adresse (iCloud), kein eigenes DKIM, DMARC nicht erfüllbar. Mails können im Spam landen.
  Lösung: eigene Domain mit SPF/DKIM/DMARC. `MAIL_FROM_NAME` in Vercel und der Test in Gmail/Outlook stehen noch aus.
- **Datenschutz:** Link zeigt auf planecobuilding.de statt auf die echte Datenschutzerklärung; keine Checkbox/kein Hinweis im Formular.
  Aufbewahrung und Löschanfragen sind nicht geregelt (Spezifikation §13).
- **Spam / Missbrauch:** Kein Rate-Limit, kein Honeypot, kein Captcha. Jeder kann eine fremde Mail eintragen und so eine Bestätigung an Dritte auslösen.

**Betrieb**
- **Kein automatischer Retry** für fehlgeschlagene Mails („Erneut verarbeiten“ holt nur Zuordnung und Adresssuche nach). Idee: „Erneut senden“ oder Cron.
- **Brevo-Key läuft ab** nach 1 Jahr oder 90 Tagen ohne Nutzung → Mails `failed`, sichtbar im Dashboard.
- **Kein Backup** außer Supabase-Free-Standard (keine Point-in-Time-Recovery).
- Ohne `SUPABASE_PUBLISHABLE_KEY` liefern `/login` und `/admin` einen 500er. Bei neuen Umgebungen daran denken.
- Builds laufen ohne Turbopack-Cache (`next.config.ts`), weil der Cache auf Vercel ein altes Tailwind-Theme behalten hat. Etwas langsamer, dafür verlässlich.

**Rechte und Login**
- **Jeder Supabase-Auth-Nutzer sieht alle Anfragen.** Sicher nur, solange die Selbstregistrierung aus ist. Rollen fehlen.
- Kein Passwort-Reset, kein eigenes Rate-Limit auf den Login (Supabase hat ein Basis-Limit). Login-Seite nicht im Planeco-Design.

**Dashboard**
- **Braucht JavaScript** (Menüs, sofortiges Speichern); die Prüfliste geht auch ohne. Nur für Desktop gebaut (unter 1024 px scrollt die Liste in sich).
- Gruppieren, Filtern und die Analyse rechnen in TypeScript über alle Anfragen; bei vielen tausend Anfragen besser serverseitig (View/RPC).
- Falsche Zuordnungen lassen sich nicht nachträglich verschieben, keine freie Kontaktsuche in der Prüfliste, keine Notizen/Historie (Backlog, Spezifikation §12).
- Kosten pro Anfrage fehlen (keine Werbekosten im System); „taugt etwas“ = Quote qualifiziert. Kampagnennamen nur, wenn die Anzeigen UTM-Parameter mitgeben.

**Adressen (Photon)**
- **Photon findet nicht jede Adresse** und schlägt oft nur die Straße vor; „Am Mühlenteich 7, Groß Grönau“ liefert falsche Straßen. Felder bleiben editierbar, „Manuell eingeben“ als Ausweg.
- **Mehrdeutige Adressen** („Hauptstraße 14“ mehrfach in Dresden); das Label zeigt den Ortsteil. Die Case-Beispiele haben teils PLZ, die nicht zur Straße passen.
- Photon ist ein Fair-Use-Dienst ohne SLA. Ausfall blockiert nie das Absenden; die Adresse wird dann später nachgeschlagen.

**CSV-Export**
- Werte mit `= + - @` am Anfang bekommen ein `'` (Formel-Schutz), betrifft auch `+49…`-Nummern.
- Für deutsches Excel nicht optimal: Koordinaten mit Punkt, Datum mit zweistelligem Jahr. Ideen: Dezimalkomma, `19.10.2026 16:47`.

**Formular**
- Bis die Bildschirmbreite feststeht, zeigt die Startseite kurz nur die Hintergrundfläche (kein Server-Rendering des Formulars).
- Nicht geprüft: echtes Android, Screenreader.

## Feature Requests / Ideen

- Adresssuche: „Bitte Vorschlag prüfen“-Hinweis nach Auswahl.
- Formular-Fortschritt bei schlechter Verbindung im Browser zwischenspeichern.

## Setup-Notizen

- Umgebungsvariablen siehe `.env.example` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `BREVO_API_KEY`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`). Lokal in `.env.local`, auf Vercel unter Project Settings → Environment Variables.
- Dev-Server: `npm run dev` im Projektordner.
