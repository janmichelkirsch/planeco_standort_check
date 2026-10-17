# lib/mail/

Mailversand. Nur serverseitig.

- `brevo.ts` – `sendMail()`: verschickt eine Mail über die Brevo-API (Transactional Email), Timeout 10 s,
  wirft bei Fehlern eine lesbare Meldung (z. B. „Brevo 401: …“). Liest `BREVO_API_KEY`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`.
- `layout.ts` – `renderMailLayout()` und `MAIL_SIGNATURE_TEXT`: gemeinsamer Rahmen aller automatischen Mails im Planeco-Stil
  (schlichter Text, Team-Signatur, fiktive Telefonnummer aus dem Film-/Fiktionsblock 040 66969, Website, Logo, Firmen-Fußzeile, Demo-Hinweis).
  Logo-URL: `MAIL_ASSET_BASE_URL`, sonst `https://${VERCEL_PROJECT_PRODUCTION_URL}`, sonst Text „planeco“. Neue Mails liefern nur ihren Inhalt.
- `confirmation.ts` – Bestätigungsmail (Betreff, HTML- und Textversion). Nutzereingaben werden im HTML per `escapeHtml()` entschärft.
- `send-confirmation.ts` – `sendConfirmation()`: verschickt die Mail und speichert `sent`/`failed` (+ Grund) an der Anfrage. Wirft nie.
