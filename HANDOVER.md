# Handover

Laufendes Log für alle, die am Projekt arbeiten (Menschen und Agents). Neueste Einträge oben.

## Änderungslog

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

- **Zustellbarkeit:** Absender ist eine Freemail-Adresse (iCloud), Brevo warnt: kein eigenes DKIM, DMARC nicht erfüllbar.
  Mails können im Spam landen oder abgelehnt werden. Für den Livegang: eigene Domain mit SPF/DKIM/DMARC.
- **Brevo-Key läuft ab** nach 1 Jahr oder 90 Tagen ohne Nutzung. Folge: Mails `failed`, sichtbar im Dashboard.
- **Kein automatischer Retry** für fehlgeschlagene Mails. Idee: „Erneut senden“-Button im Dashboard oder Cron, der `failed`/alte `pending` nachholt.
- **Textversion der Mail** enthält Namen roh. Manche Mailprogramme machen URLs in Text klickbar.
  Idee: Namen mit `<`, `>` oder `://` schon im Formular ablehnen.
- **Jeder kann eine fremde E-Mail eintragen** und so eine Bestätigung an Dritte auslösen (Hinweis in der Mail: „nicht gestellt? ignorieren“). Gegenmittel später: Rate-Limit, Captcha.
- Ohne SQL `003` zeigt das Dashboard keinen sinnvollen Mailstatus, und das Speichern des Status scheitert (nur geloggt, Anfrage bleibt gespeichert).

- **Photon schlägt oft nur die Straße vor** (z. B. „Osterstraße 88 Hamburg“ → Straße ohne Nr., erster Treffer sogar „Heußweg“). Das Nr.-Feld fängt das ab, der Prüfhinweis bleibt wichtig.
- Bis die Bildschirmbreite feststeht, zeigt die Startseite kurz nur die Hintergrundfläche (kein Server-Rendering des Formulars).
- Der lokale Dev-Server einer anderen Session (Port 3000) lieferte veraltetes CSS. Zum Prüfen wurde ein Produktions-Build auf Port 3101 genutzt.

- Ohne `SUPABASE_PUBLISHABLE_KEY` liefern `/login` und `/admin` einen 500er (Proxy bricht ab). Bei neuen Umgebungen daran denken.
- **Jeder Supabase-Auth-Nutzer sieht alle Anfragen.** Das ist nur sicher, solange die Selbstregistrierung aus ist. Rollen fehlen noch.
- **Tabelle zeigt max. 1000 Zeilen** (Hinweis wird angezeigt), der Export lädt alle seitenweise.
- **CSV:** Werte mit = + - @ am Anfang bekommen ein `'` (Formel-Schutz), betrifft auch `+49…`-Telefonnummern.
  Telefonnummern ohne Leerzeichen mit führender 0 könnte Excel als Zahl lesen (0 fällt weg). Löst sich mit E.164-Normalisierung.
- **CSV-Formate für deutsches Excel noch nicht optimal:** Koordinaten mit Punkt (`51.672678`) liest deutsches Excel ggf. als Text/Datum,
  Datum mit zweistelligem Jahr (`17.10.26, 16:47`). Ideen: Dezimalkomma, `17.10.2026 16:47`.
- Kein Passwort-Reset, kein Rate-Limit auf Login (Supabase hat ein eigenes Basis-Limit).

- **Zeitzone:** `created_at` wird in UTC gespeichert (korrekt). Dashboard und CSV-Export müssen in Europe/Berlin anzeigen.

- **Datenbank-Region London statt Frankfurt.** Bewusst für den Test so belassen. Region lässt sich bei Supabase nicht umstellen,
  ein Umzug heißt neues Projekt + Export/Import + neue Keys in Vercel. Vor dem Livegang erledigen, solange wenige Daten drin sind.
- **Photon findet nicht jede Adresse.** „Am Mühlenteich 7, Groß Grönau“ (Beispiel #5) liefert nur ähnliche, *falsche* Straßen im selben Ort.
  Risiko: Nutzer klickt einen falschen Vorschlag. Ideen: Hinweis „Bitte Vorschlag prüfen“, Straßenname-Abgleich, manuelle Eingabe prominenter.
- **Mehrdeutige Adressen:** „Hauptstraße 14“ existiert mehrfach in Dresden, mit unterschiedlichen PLZ. Die PLZ 01067 aus Beispiel #1 taucht in den Photon-Treffern nicht auf.
  Darum zeigt das Label den Ortsteil. Die Felder bleiben editierbar.
- Photon ist ein öffentlicher Fair-Use-Dienst ohne SLA. Bei Ausfall bleibt die manuelle Eingabe (getestet über Fehleranzeige).
- Telefonnummern werden nur grob geprüft, die E.164-Normalisierung folgt mit dem neuen Datenmodell.
- Kein Schutz vor Doppelklick/Doppel-Submit (Button ist während des Sendens deaktiviert, sonst nichts).

## Feature Requests / Ideen

- Adresssuche: „Bitte Vorschlag prüfen“-Hinweis nach Auswahl.
- Formular-Fortschritt bei schlechter Verbindung im Browser zwischenspeichern.

## Setup-Notizen

- Umgebungsvariablen siehe `.env.example` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `BREVO_API_KEY`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`). Lokal in `.env.local`, auf Vercel unter Project Settings → Environment Variables.
- Dev-Server: `npm run dev` im Projektordner.
