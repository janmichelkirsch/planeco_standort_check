# Roadmap

Legende: ✅ erledigt · 🔄 in Arbeit · ⬜ geplant

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

- 🔄 Datenmodell normalisieren (Kontakt ↔ Anfrage): Spezifikation [`docs/spezifikation_v3.md`](docs/spezifikation_v3.md) abgestimmt, Umsetzung auf Branch `feat/contact-data-model` (Schritte §11)
  - ✅ Schritt 1: SQL `004` (Tabellen, Trigger, Funktionen, RLS) + lokale Tests (`supabase/tests/run.sh`)
  - ⬜ `004` in Supabase ausführen (vorher Login-E-Mails eintragen), Team Members prüfen
  - ⬜ Schritt 2: Normalisierung (`libphonenumber-js`) + Schema um Tracking und `clientRequestId`
- ⬜ Normalisierung Telefon (E.164) und E-Mail
- ⬜ Dubletten-Matching über Telefon und E-Mail (Regeln: Spezifikation §7, Prüfliste für Teiltreffer)
- ⬜ Kampagnen-Tracking: UTM-Parameter, gclid, fbclid, Referrer, Landingpage
- ✅ Bestätigungsmail über Brevo (erst speichern, dann per `after()` senden, Mailstatus im Dashboard)
- ✅ SQL `003` ausführen, Brevo-Variablen in Vercel, Live-Test der Mail
- ✅ Mails im Planeco-Design (gemeinsames Layout mit Signatur, Logo, Fußzeile)
- ⬜ `MAIL_FROM_NAME` in Vercel ändern, Live-Test der neuen Mail in Gmail und Outlook
- ⬜ Dashboard an neues Datenmodell anpassen (Dubletten-Hinweis, Kampagne)
- ⬜ Status, Ergebnis (`outcome`) und Zuständigkeit pro Anfrage (doppelte Bearbeitung vermeiden)
- ⬜ Datenschutz-Checkbox / Hinweis

## Iteration 3 – Erweiterung und Robustheit

- ⬜ Anreicherung: Gemeinde, Bundesland, Koordinaten auch für manuell eingegebene Adressen
- ⬜ Einzugsgebiet-Markierung: alle 16 Bundesländer, als Liste im Code einschränkbar
- ⬜ Schutz vor doppeltem Absenden (`client_request_id`, Teil des neuen Datenmodells)
- ⬜ Spam-Schutz (Honeypot, ggf. Rate-Limit)
- ⬜ Automatische Tests (Vitest) für Photon-Mapping und Schema
- ⬜ Login und Dashboard im Planeco-Design

## Vor dem Livegang

- ⬜ Supabase-Projekt nach Frankfurt umziehen (DSGVO-sauberer, Region nicht nachträglich änderbar)

## Abgabe

- ⬜ Eine Seite Notizen: Entscheidungen, Offenes, nächste Schritte
- ⬜ Repo-Zugang für Planeco klären (öffentlich oder Einladung)
