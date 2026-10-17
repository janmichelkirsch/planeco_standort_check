# lib/mail/

Mailversand. Nur serverseitig.

- `brevo.ts` – `sendMail()`: verschickt eine Mail über die Brevo-API (Transactional Email), Timeout 10 s,
  wirft bei Fehlern eine lesbare Meldung (z. B. „Brevo 401: …“). Liest `BREVO_API_KEY`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME`.
- `confirmation.ts` – Bestätigungsmail (Betreff, HTML- und Textversion). Nutzereingaben werden im HTML per `escapeHtml()` entschärft.
