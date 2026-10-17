import type { MailMessage } from "@/lib/mail/brevo";
import { MAIL_SIGNATURE_TEXT, renderMailLayout } from "@/lib/mail/layout";

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
    MAIL_SIGNATURE_TEXT,
  ].join("\n");

  const html = renderMailLayout(`<p style="margin: 0;">Guten Tag ${escapeHtml(name)},</p>
          <p style="margin: 16px 0 0;">vielen Dank für Ihre Anfrage zum kostenlosen Standort-Check für folgendes Grundstück:</p>
          <p style="margin: 16px 0 0;"><strong>${escapeHtml(address)}</strong></p>
          <p style="margin: 16px 0 0;">Unser Team meldet sich innerhalb von 1–2 Werktagen telefonisch bei Ihnen.</p>
          <p style="margin: 16px 0 0; color: #6b6b6b; font-size: 13px;">Sie haben diese Anfrage nicht gestellt? Dann können Sie diese E-Mail ignorieren.</p>`);

  return { to: { email: data.email, name }, subject: SUBJECT, html, text };
}
