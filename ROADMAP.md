# Roadmap

Legende: ✅ erledigt · 🔄 in Arbeit · ⬜ geplant

## Iteration 1 – Speed-MVP (Durchstich testen)

Ziel: einmal die ganze Strecke Formular → Supabase → Vercel funktionierend sehen.

- ✅ Next.js-Projekt aufsetzen
- ✅ Flache Tabelle `leads` (`supabase/001_leads.sql`)
- ✅ Formular, mobile-first: erst Grundstücksadresse, dann Kontaktdaten
- ✅ Adresssuche mit Photon + „Manuell eingeben“ als Fallback
- ✅ Server-Route `POST /api/lead` mit Validierung und Insert
- ⬜ Supabase-Projekt anlegen und SQL ausführen
- ⬜ Deployment auf Vercel und Test auf echtem Handy

## Iteration 2 – Pflichtteil vervollständigen

- ⬜ Datenmodell normalisieren (Kontakt ↔ Anfrage), vorher gemeinsam besprechen
- ⬜ Normalisierung Telefon (E.164) und E-Mail
- ⬜ Dubletten-Matching über Telefon und E-Mail, Merge-Strategie vorher besprechen
- ⬜ Kampagnen-Tracking: UTM-Parameter, gclid, fbclid, Referrer, Landingpage
- ⬜ Bestätigungsmail über Brevo (erst speichern, dann senden, Mailstatus speichern)
- ⬜ Admin-Dashboard: Login, Tabelle, Sortierung, CSV-Export (Excel-tauglich, UTF-8-BOM)
- ⬜ Status und Zuständigkeit pro Lead (doppelte Bearbeitung vermeiden)
- ⬜ Datenschutz-Checkbox / Hinweis

## Iteration 3 – Erweiterung und Robustheit

- ⬜ Anreicherung: Gemeinde, Bundesland, Koordinaten auch für manuell eingegebene Adressen
- ⬜ Einzugsgebiet-Markierung (vermutlich über Bundesland/Gemeinde, konfigurierbar)
- ⬜ Schutz vor doppeltem Absenden (Idempotenz-Key)
- ⬜ Spam-Schutz (Honeypot, ggf. Rate-Limit)
- ⬜ Automatische Tests (Vitest) für Photon-Mapping und Schema
- ⬜ UI-Design

## Abgabe

- ⬜ Eine Seite Notizen: Entscheidungen, Offenes, nächste Schritte
- ⬜ Repo-Zugang für Planeco klären (öffentlich oder Einladung)
