# Handover

Laufendes Log für alle, die am Projekt arbeiten (Menschen und Agents). Neueste Einträge oben.

## Änderungslog

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
