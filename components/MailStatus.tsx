import { CONFIRMATION_STATUS_LABEL, formatBerlinDateTime } from "@/lib/format";
import type { ConfirmationStatus } from "@/lib/dashboard";

const STYLE = {
  sent: "text-green-700",
  failed: "font-semibold text-red-700",
  pending: "text-zinc-500",
} as const;

const ICON = { sent: "✓", failed: "✗", pending: "…" } as const;

type Confirmation = { confirmation_status: ConfirmationStatus; confirmation_sent_at: string | null; confirmation_error: string | null };

/** Versandstatus der Bestätigungsmail. Details (Zeitpunkt bzw. Fehlergrund) als Tooltip. */
export function MailStatus({ intake }: { intake: Confirmation }) {
  const status = intake.confirmation_status;
  const detail =
    status === "sent" && intake.confirmation_sent_at
      ? `gesendet am ${formatBerlinDateTime(intake.confirmation_sent_at)}`
      : status === "failed"
        ? (intake.confirmation_error ?? "unbekannter Fehler")
        : "Versand noch nicht abgeschlossen";

  return (
    <span className={STYLE[status]} title={detail}>
      {ICON[status]} {CONFIRMATION_STATUS_LABEL[status]}
    </span>
  );
}
