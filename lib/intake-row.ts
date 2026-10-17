import type { LeadInput } from "@/lib/lead-schema";
import { normalizeEmail, normalizePhone } from "@/lib/normalize";

/** Zeile für `incoming_submissions` (Spezifikation v3, §3.4). */
export type IntakeRow = {
  client_request_id: string;
  payload: Omit<LeadInput, "clientRequestId">;
  normalized_email: string;
  normalized_phone: string;
};

/** Baut die Zeile aus einer geprüften Anfrage. `null`, wenn die Telefonnummer nicht gültig ist. */
export function toIntakeRow(lead: LeadInput, fallbackRequestId: () => string): IntakeRow | null {
  const phone = normalizePhone(lead.phone, lead.phoneCountry);
  if (!phone) return null;
  // Die ID steht in einer eigenen Spalte, nicht zusätzlich im Payload.
  const { clientRequestId, ...payload } = lead;
  return {
    // Fehlt sie (Aufruf nicht über unser Formular), gibt es keine Idempotenz, aber der Eingang geht nicht verloren.
    client_request_id: clientRequestId ?? fallbackRequestId(),
    payload,
    normalized_email: normalizeEmail(lead.email),
    normalized_phone: phone,
  };
}
