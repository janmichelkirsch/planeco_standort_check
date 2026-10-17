/**
 * Gemeinsamer Rahmen aller automatischen Mails im Planeco-Stil: schlichter Text wie eine persönliche Mail,
 * darunter Signatur, Website, Logo und Firmen-Fußzeile.
 * Neue Mails liefern nur ihren Inhalt und bekommen Rahmen und Signatur von hier.
 */

const SIGNATURE = {
  name: "Ihr Planeco-Team",
  role: "Standort-Check",
  // Fiktive Nummer aus dem Block, den die Bundesnetzagentur für Film und Fiktion reserviert hat (040 66969 xxx).
  phone: "+49 40 66969 123",
  website: "www.planecobuilding.de",
  websiteUrl: "https://www.planecobuilding.de",
};

const LEGAL_FOOTER =
  "Planeco Building GmbH | Brauhausstraße 19, 22041 Hamburg, DE | Geschäftsführung: Stefan Dietrich | " +
  "Handelsregistereintragung: Amtsgericht Hamburg HRB 177700 | USt-IdNr.: DE 357555071";

const DEMO_NOTICE = "Demo im Rahmen einer Case Study";

const LOGO_PATH = "/images/planeco-logo.jpeg";

const COLOR = { text: "#1a1a1a", name: "#2f3b38", muted: "#6b6b6b", green: "#1f3a33", footer: "#8a8a8a" };
const BODY_FONT = "Arial, Helvetica, sans-serif";
const BRAND_FONT = "Poppins, Arial, Helvetica, sans-serif";

/**
 * Öffentliche Adresse, unter der Mailprogramme das Logo laden können.
 * `MAIL_ASSET_BASE_URL` überschreibt, sonst die Produktionsdomain, die Vercel automatisch setzt.
 */
function assetBaseUrl(): string | null {
  const explicit = process.env.MAIL_ASSET_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : null;
}

function logoHtml(): string {
  const base = assetBaseUrl();
  if (!base) {
    return `<span style="font-family: ${BRAND_FONT}; font-size: 28px; font-weight: 600; color: ${COLOR.green};">planeco</span>`;
  }
  return `<img src="${base}${LOGO_PATH}" alt="planeco" width="200" height="49" style="display: block; border: 0; width: 200px; height: auto;" />`;
}

function signatureHtml(): string {
  return `<p style="margin: 24px 0 0;">Liebe Grüße,</p>
          <p style="margin: 20px 0 0; font-size: 20px; font-weight: bold; color: ${COLOR.name};">${SIGNATURE.name}</p>
          <p style="margin: 0; font-size: 13px; color: ${COLOR.muted};">${SIGNATURE.role}</p>
          <p style="margin: 16px 0 0;">${SIGNATURE.phone}</p>
          <p style="margin: 20px 0 0;"><a href="${SIGNATURE.websiteUrl}" style="font-family: ${BRAND_FONT}; font-weight: bold; color: ${COLOR.green}; text-decoration: underline;">${SIGNATURE.website}</a></p>
          <div style="margin: 20px 0 0;">${logoHtml()}</div>
          <p style="margin: 20px 0 0; font-family: ${BRAND_FONT}; font-size: 11px; line-height: 1.6; color: ${COLOR.footer};">${LEGAL_FOOTER}</p>
          <p style="margin: 8px 0 0; font-family: ${BRAND_FONT}; font-size: 11px; color: ${COLOR.footer};">${DEMO_NOTICE}</p>`;
}

/** Legt bereits entschärftes Inhalts-HTML in den Planeco-Rahmen mit Signatur und Fußzeile. */
export function renderMailLayout(bodyHtml: string): string {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin: 0; padding: 0; background: #ffffff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff;">
      <tr>
        <td style="padding: 16px;">
          <div style="max-width: 600px; font-family: ${BODY_FONT}; font-size: 15px; line-height: 1.5; color: ${COLOR.text};">
          ${bodyHtml}
          ${signatureHtml()}
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Signatur für die Textversion, an den Mailtext anzuhängen. */
export const MAIL_SIGNATURE_TEXT = [
  "Liebe Grüße,",
  "",
  SIGNATURE.name,
  SIGNATURE.role,
  "",
  SIGNATURE.phone,
  SIGNATURE.websiteUrl,
  "",
  "--",
  LEGAL_FOOTER,
  DEMO_NOTICE,
].join("\n");
