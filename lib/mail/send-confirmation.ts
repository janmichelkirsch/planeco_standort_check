import "server-only";
import { sendMail } from "@/lib/mail/brevo";
import { buildConfirmationMail, type ConfirmationData } from "@/lib/mail/confirmation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Verschickt die Bestätigungsmail zu einer gespeicherten Anfrage und hält das Ergebnis an der Anfrage fest.
 * Wirft nie: Ein Fehler beim Mailversand darf die bereits gespeicherte Anfrage nicht gefährden.
 */
export async function sendConfirmation(leadId: string, data: ConfirmationData): Promise<void> {
  let update: { confirmation_status: "sent" | "failed"; confirmation_sent_at: string | null; confirmation_error: string | null };

  try {
    await sendMail(buildConfirmationMail(data));
    update = { confirmation_status: "sent", confirmation_sent_at: new Date().toISOString(), confirmation_error: null };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[mail] Bestätigung für ${leadId} fehlgeschlagen:`, reason);
    update = { confirmation_status: "failed", confirmation_sent_at: null, confirmation_error: reason.slice(0, 500) };
  }

  const { error } = await getSupabaseAdmin().from("leads").update(update).eq("id", leadId);
  if (error) {
    console.error(`[mail] Mailstatus für ${leadId} konnte nicht gespeichert werden`, error);
  }
}
