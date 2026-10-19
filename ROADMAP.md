# Roadmap

Legende: ✅ erledigt · 🔄 in Arbeit · ⬜ geplant / bewusst offen

**Stand 19. Oktober 2026: Projekt abgeschlossen.** Alles liegt auf `main` und ist live unter https://planeco-standort-check-two.vercel.app
(Dashboard: `/admin`). Was noch mit ⬜ markiert ist, wurde bewusst nicht mehr umgesetzt; Gründe und Ideen stehen im HANDOVER unter „Offene Punkte“.

## Iteration 1 – Speed-MVP (Durchstich testen)

Ziel: einmal die ganze Strecke Formular → Supabase → Vercel funktionierend sehen.

- ✅ Next.js-Projekt aufsetzen
- ✅ Flache Tabelle `leads` (`supabase/001_leads.sql`)
- ✅ Formular, mobile-first: erst Grundstücksadresse, dann Kontaktdaten
- ✅ Adresssuche mit Photon + „Manuell eingeben“ als Fallback
- ✅ Server-Route `POST /api/lead` mit Validierung und Insert
- ✅ Supabase-Projekt anlegen (Region London)
- ✅ SQL ausführen
- ✅ Deployment auf Vercel und Test auf echtem Handy (https://planeco-standort-check-two.vercel.app)

## Iteration 1b – Speed-Dashboard

- ✅ Login (Supabase Auth, E-Mail + Passwort), Logout, Zugangsschutz `/admin`
- ✅ Leserecht per RLS nur für eingeloggte Nutzer (`002_dashboard_read.sql`)
- ✅ Tabelle aller Anfragen, deutsche Zeit
- ✅ Sortierung per Spaltenklick
- ✅ CSV-Export (Excel-tauglich, alle Zeilen)
- ✅ SQL `002` ausführen, `SUPABASE_PUBLISHABLE_KEY` in Vercel, Live-Test mit Testnutzer

## Iteration 1c – Formular im Planeco-Design

- ✅ Design aus Figma Make übernommen (nur Optik, Logik bleibt bei uns)
- ✅ Mobile zweistufig (Grundstück → Kontakt), Desktop zweispaltig mit Formular-Karte
- ✅ Fehler direkt am Feld, Prüfung pro Schritt, Telefon Pflicht, PLZ 5-stellig
- ⬜ Datenschutz-Link auf die echte Datenschutzerklärung umstellen (aktuell planecobuilding.de)

## Iteration 2 – Pflichtteil vervollständigen

- ✅ Datenmodell normalisieren (Kontakt ↔ Anfrage): Spezifikation [`docs/spezifikation_v3.md`](docs/spezifikation_v3.md), umgesetzt in den Schritten §11
  - ✅ Schritt 1: SQL `004` (Tabellen, Trigger, Funktionen, RLS) + lokale Tests (`supabase/tests/run.sh`)
  - ✅ `004` in Supabase ausgeführt, Team Members Emily, Björn, Michel angelegt
  - ✅ Schritt 2: Normalisierung (`libphonenumber-js`) + Schema um Tracking, Vorwahl-Land, `clientRequestId`; Vitest eingerichtet
  - ✅ Schritt 3: Formular (Vorwahl-Dropdown mit Formatierung beim Tippen, Tracking aus der URL, `clientRequestId`, Kreis/Gemeinde aus Photon)
  - ✅ Schritt 4: API schreibt in `incoming_submissions`, `after()` mit Mail + `process_intake`
  - ✅ Branch gepusht, auf der Vercel-Vorschau getestet: neuer Kontakt, Auto-Match, Prüffall, Mail jeweils `sent`, Tracking übernommen
  - ✅ Schritt 6: Dashboard auf neues Modell (Kontakte mit aufklappbaren Anfragen, Reiter, Hinweise, „Erneut verarbeiten“, CSV-Export)
  - ✅ Schritt 7: Prüfliste `/admin/review` (nur vorgeschlagene Kandidaten, Name behalten/übernehmen, neuer Kontakt)
  - ✅ Schritt 8: Bearbeiten (Übernehmen, Zuständig ändern/freigeben, Status, Ergebnis, Bearbeiter, Kontaktname)
  - ✅ Schritt 5: Geocoding manueller Adressen (nur gleiche PLZ, sonst nur Ort; Stadtstaaten-Bundesland ergänzt)
  - ✅ Schritt 9: Merge auf `main` (PR #1, 19.10.), Live-Test, danach `005_drop_leads.sql` in Supabase ausgeführt
- ✅ Normalisierung Telefon (E.164) und E-Mail
- ✅ Dubletten-Matching über Telefon und E-Mail (Regeln: Spezifikation §7, Prüfliste für Teiltreffer)
- ✅ Kampagnen-Tracking: UTM-Parameter, gclid, fbclid, Referrer, Landingpage
- ✅ Bestätigungsmail über Brevo (erst speichern, dann per `after()` senden, Mailstatus im Dashboard)
- ✅ SQL `003` ausführen, Brevo-Variablen in Vercel, Live-Test der Mail
- ✅ Mails im Planeco-Design (gemeinsames Layout mit Signatur, Logo, Fußzeile)
- ⬜ `MAIL_FROM_NAME` in Vercel ändern, Live-Test der neuen Mail in Gmail und Outlook
- ✅ Dashboard an neues Datenmodell anpassen (Dubletten-Hinweis, Kampagne)
- ✅ Status, Ergebnis (`outcome`) und Zuständigkeit pro Anfrage (doppelte Bearbeitung vermeiden)
- ⬜ Datenschutz-Checkbox / Hinweis

## Iteration 3 – Erweiterung und Robustheit

- ✅ Anreicherung: Gemeinde, Bundesland, Koordinaten auch für manuell eingegebene Adressen
- ✅ Einzugsgebiet-Markierung: alle 16 Bundesländer, als Liste im Code einschränkbar
- ✅ Schutz vor doppeltem Absenden (`client_request_id`, Teil des neuen Datenmodells)
- ⬜ Spam-Schutz (Honeypot, ggf. Rate-Limit)
- ✅ Automatische Tests (Vitest): Schema, Normalisierung, Telefonfeld, Tracking, Photon-Mapping
- ✅ Dashboard im Planeco-Design (Branch `feat/dashboard-redesign`, mit PR #1 auf `main`)
  - ✅ Inbox, Kontaktliste, Anfragekarte (sofort speichern), Prüfliste
  - ✅ Analyse: Kacheln, Verlauf, Rückmeldung, Datenqualität (Vergleichstabelle nach Rückmeldung von Michel wieder entfernt)
  - ✅ Live getestet (Testanfrage → `incoming_submissions`, `processed`)
- ⬜ Login-Seite im Planeco-Design

## Nächste Schritte

Mit Michel nach Projektabschluss abgestimmt. Grundsatz: **Erst das Bestehende sicher und zuverlässig betreiben, dann neue Features.**
Die Phasen ersetzen die früheren Abschnitte „Backlog“ und „Vor dem Livegang“; Details zu den offenen Punkten stehen im HANDOVER.

| Priorität | Thema | Zeitpunkt |
|---|---|---|
| **P0** | Security-Audit, DSGVO, End-to-End-Tests | vor Go-live |
| **P0** | Matching und Kampagnen-Tracking validieren | vor Go-live |
| **P1** | CSV-Export verbessern | kurzfristig |
| **P1** | Erweiterte Marketing-Analytics | kurzfristig |
| **P2** | Kontakt-Merging und bessere Dublettenerkennung | mittelfristig |
| **P2** | Automatische geografische Sales-Zuordnung | mittelfristig |
| **P3** | Planungsrechtliche Standortanalyse | langfristig |

Produktbild: **MVP** = Leads erfassen, strukturiert speichern, effizient bearbeiten (Stand heute) · **Version 2** = Leads und Kampagnen besser auswerten,
Sales-Prozesse automatisieren · **Version 3** = Standort-Check um Grundstücksinformationen erweitern und die Qualifizierung verbessern.

### Phase 1 – Go-live Readiness: Sicherheit und Zuverlässigkeit (P0)

- ⬜ **Security-Audit:** RLS-Policies, API-Zugriffe, Authentifizierung; Rollen statt „jeder Login sieht alles“; Passwort-Reset, Login-Limit.
- ⬜ **Datenschutz-Check:** DSGVO, Datenverarbeitung durch externe Dienste (Supabase, Vercel, Brevo, Photon), Aufbewahrungsfristen, Löschanfragen;
  echte Datenschutzerklärung verlinken, Hinweis/Checkbox im Formular; Supabase-Projekt nach Frankfurt umziehen (Region nicht nachträglich änderbar).
- ⬜ **End-to-End-Tests:** der ganze Weg Formular → Eingang → Zuordnung → Mail → Dashboard → Export, automatisiert.
- ⬜ **Matching-Tests:** Sonderfälle bei Telefonnummern (Länder, Formate), Mails und Namen; Akzeptanztests aus Spezifikation §10 gegen das echte Supabase.
- ⬜ **Datenintegrität:** stimmen Verknüpfungen Kontakt ↔ Methoden ↔ Anfragen, Tracking und Anreicherung nach echten Eingängen?
- ⬜ **Kampagnen-Tracking verifizieren:** UTM, `gclid`, `fbclid` mit echten Anzeigen-Links aus Meta und Google Ads (UTM-Vorlagen in den Anzeigen hinterlegen).
- ⬜ **Sales-Workflow testen:** zwei Mitarbeiter übernehmen nicht versehentlich denselben Kontakt bzw. Prüffall. Technisch schon in der Datenbank abgesichert
  (`claim_contact` setzt nur, wenn niemand zuständig ist; Prüfliste mit Sperre und `P0409`) – hier geht es um den Nachweis mit zwei echten Logins.
- ⬜ **Betrieb:** eigene Mail-Domain mit SPF/DKIM/DMARC, `MAIL_FROM_NAME` in Vercel, Spam-Schutz (Honeypot, Rate-Limit), Mail erneut senden, Backups.

### Phase 2 – Sales-Dashboard und Analytics verbessern (P1–P2)

- ⬜ **A. Erweiterte Marketing-Analytics (P1):** Welche Kampagnen bringen nicht die meisten, sondern die wertvollsten Leads? Qualifizierungsquote pro Kampagne
  (die Vergleichstabelle dafür war gebaut und ist auf Wunsch wieder entfernt, `lib/analyse.ts` rechnet sie noch), später Werbeausgaben importieren
  und Kosten pro qualifiziertem Lead berechnen.
- ⬜ **B. CSV-Export verbessern (P1):** Der Export führt heute schon Kontakt, Anfrage, Grundstück und Kampagne in einer Zeile pro Anfrage zusammen (plus Prüffälle).
  Ziel: benutzerfreundlicher für Sales und deutsches Excel – weniger, verständlich benannte Spalten, Datum `19.10.2026 16:47`, Dezimalkomma, ggf. Varianten je Zweck.
- ⬜ **C. Kontakt-Matching weiterentwickeln (P2):** bessere Erkennung möglicher Dubletten (z. B. ähnliche Namen, gleiche Adresse), freie Kontaktsuche in der Prüfliste,
  kontrolliertes Zusammenführen von Kontakten und Verschieben falsch zugeordneter Anfragen – mit erhaltener Historie und Schutz vor falschen Zusammenführungen.
- ⬜ Login-Seite im Planeco-Design; Dashboard-Zählungen serverseitig (View/RPC), sobald es viele tausend Anfragen sind.

### Phase 3 – Intelligente Standortanalyse und Automatisierung (P2–P3)

- ⬜ **A. Automatische geografische Mitarbeiterzuordnung (P2):** Das Sales-Team zeichnet seine Gebiete auf einer Karte; eine neue Anfrage wird anhand der
  Grundstückskoordinaten dem Gebiet und damit dem zuständigen Mitarbeiter zugeordnet. Das Prinzip bleibt: ein Hauptansprechpartner pro Kontakt,
  einzelne Anfragen können andere übernehmen. Voraussetzung: Koordinaten auch bei „nur Ort ermittelt“ bzw. ein Rückfall über Gemeinde/PLZ.
- ⬜ **B. Erweiterte Standortanalyse (P3):** Aus der vorhandenen Anreicherung (Koordinaten, Gemeinde, Bundesland) eine Standortbewertung entwickeln:
  administrative Zuständigkeit, Bebauungspläne und planungsrechtliche Festsetzungen, Gebietsausweisung, Hinweise auf Einschränkungen für bestimmte Vorhaben –
  über kommunale Geoportale und öffentliche Geodaten. Ziel ist keine Vorhersage der Baugenehmigung, sondern relevante Informationen für Sales vor dem ersten Telefonat.

## Abgabe

- ⬜ Eine Seite Notizen: Entscheidungen, Offenes, nächste Schritte (schreibt Michel; Stoff dafür: HANDOVER)
- ⬜ Repo-Zugang für Planeco klären (öffentlich oder Einladung)
