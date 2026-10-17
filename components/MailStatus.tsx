import { CONFIRMATION_STATUS_LABEL, formatBerlinDateTime } from "@/lib/format";
import type { LeadRow } from "@/lib/leads";

const STYLE = {
  sent: "text-green-700",
  failed: "font-semibold text-red-700",
  pending: "text-zinc-500",
} as const;

const ICON = { sent: "✓", failed: "✗", pending: "…" } as const;

/** Versandstatus der Bestätigungsmail. Details (Zeitpunkt bzw. Fehlergrund) als Tooltip. */
export function MailStatus({ lead }: { lead: Pick<LeadRow, "confirmation_status" | "confirmation_sent_at" | "confirmation_error"> }) {
  const status = lead.confirmation_status;
  const detail =
    status === "sent" && lead.confirmation_sent_at
      ? `gesendet am ${formatBerlinDateTime(lead.confirmation_sent_at)}`
      : status === "failed"
        ? (lead.confirmation_error ?? "unbekannter Fehler")
        : "Versand noch nicht abgeschlossen";

  return (
    <span className={STYLE[status]} title={detail}>
      {ICON[status]} {CONFIRMATION_STATUS_LABEL[status]}
    </span>
  );
}
