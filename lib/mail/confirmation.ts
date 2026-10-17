import type { MailMessage } from "@/lib/mail/brevo";

export type ConfirmationData = {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
};

const SUBJECT = "Ihre Anfrage zum kostenlosen Standort-Check ist eingegangen";

/** Entschärft Nutzereingaben für HTML, damit niemand über Formularfelder Markup oder Links in die Mail einschleust. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Baut die Bestätigungsmail als HTML- und Textversion. */
export function buildConfirmationMail(data: ConfirmationData): MailMessage {
  const name = `${data.firstName} ${data.lastName}`;
  const address = `${data.street} ${data.houseNumber}, ${data.postalCode} ${data.city}`;

  const text = [
    `Guten Tag ${name},`,
    "",
    "vielen Dank für Ihre Anfrage zum kostenlosen Standort-Check für folgendes Grundstück:",
    address,
    "",
    "Unser Team meldet sich innerhalb von 1–2 Werktagen telefonisch bei Ihnen.",
    "",
    "Sie haben diese Anfrage nicht gestellt? Dann können Sie diese E-Mail ignorieren.",
    "",
    "Viele Grüße",
    "Ihr Standort-Check-Team",
  ].join("\n");

  const html = `<!doctype html>
<html lang="de">
  <body style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; line-height: 1.5;">
    <p>Guten Tag ${escapeHtml(name)},</p>
    <p>vielen Dank für Ihre Anfrage zum kostenlosen Standort-Check für folgendes Grundstück:</p>
    <p><strong>${escapeHtml(address)}</strong></p>
    <p>Unser Team meldet sich innerhalb von 1–2 Werktagen telefonisch bei Ihnen.</p>
    <p style="color: #666666; font-size: 13px;">Sie haben diese Anfrage nicht gestellt? Dann können Sie diese E-Mail ignorieren.</p>
    <p>Viele Grüße<br />Ihr Standort-Check-Team</p>
  </body>
</html>`;

  return { to: { email: data.email, name }, subject: SUBJECT, html, text };
}
