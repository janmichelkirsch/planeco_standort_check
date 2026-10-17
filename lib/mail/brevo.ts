import "server-only";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const TIMEOUT_MS = 10_000;

export type MailMessage = {
  to: { email: string; name: string };
  subject: string;
  html: string;
  text: string;
};

function requireMailEnv(key: "BREVO_API_KEY" | "MAIL_FROM_EMAIL" | "MAIL_FROM_NAME"): string {
  const value = process.env[key];
  if (!value) throw new Error(`Umgebungsvariable ${key} ist nicht gesetzt`);
  return value;
}

/**
 * Verschickt eine einzelne Mail über die Brevo-API (Transactional Email).
 * Gibt die Brevo-Nachrichten-ID zurück oder wirft einen Fehler mit lesbarem Grund.
 */
export async function sendMail(message: MailMessage): Promise<string> {
  const response = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "api-key": requireMailEnv("BREVO_API_KEY"),
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: requireMailEnv("MAIL_FROM_EMAIL"), name: requireMailEnv("MAIL_FROM_NAME") },
      to: [message.to],
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = body?.message ?? response.statusText;
    throw new Error(`Brevo ${response.status}: ${reason}`);
  }
  return String(body?.messageId ?? "");
}
