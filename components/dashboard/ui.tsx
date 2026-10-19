import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Alert, CheckCircle, ChevronDown, Clock, PhoneOff, X } from "@/components/icons";
import type { ConfirmationStatus, Outcome, SubmissionStatus } from "@/lib/dashboard";
import { OUTCOME_TITLE, SUBMISSION_STATUS_TITLE, formatBerlinDateTime } from "@/lib/format";

/** Kleine Bausteine des Dashboards im Planeco-Design (aus dem Figma-Entwurf). Ohne Zustand, daher auch in Server Components nutzbar. */

export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export const linkCls = `rounded-sm font-medium text-forest underline decoration-line underline-offset-4 hover:decoration-forest ${focusRing}`;

/* ---------- Knöpfe ---------- */

type Tone = "primary" | "claim" | "secondary" | "ghost";
type Size = "md" | "sm";

const tones: Record<Tone, string> = {
  // Dunkles Grün für alltägliche Aktionen (Speichern, Zuordnen).
  primary: "bg-forest text-white hover:bg-forest/90",
  // Koralle nur für das, was nicht liegen bleiben darf: einen Kontakt übernehmen.
  claim: "bg-coral-strong text-white hover:bg-coral-ink",
  secondary: "border border-line bg-white text-forest hover:border-forest hover:bg-sage",
  ghost: "text-forest hover:bg-sage-deep",
};

const sizes: Record<Size, string> = {
  md: "h-11 gap-2 px-4 text-sm",
  sm: "h-9 gap-1.5 px-3 text-[13px]",
};

export function buttonClass(tone: Tone = "secondary", size: Size = "md", className = "") {
  return `inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-colors disabled:opacity-60 ${focusRing} ${tones[tone]} ${sizes[size]} ${className}`;
}

export function Button({
  tone = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: Size }) {
  return <button type={type} className={buttonClass(tone, size, className)} {...props} />;
}

/* ---------- Auswahl ---------- */

export function Select({
  label,
  id,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; id: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-forest-soft">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="block h-11 w-full appearance-none rounded-xl border border-line bg-white pr-10 pl-3.5 text-sm text-forest transition-[border-color,box-shadow] outline-none hover:border-forest-soft focus:border-forest focus:ring-4 focus:ring-forest/12 disabled:opacity-60"
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-forest-soft" />
      </div>
    </div>
  );
}

export const inputClass =
  "block h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-forest outline-none hover:border-forest-soft focus:border-forest focus:ring-4 focus:ring-forest/12";

/* ---------- Status und Ergebnis ---------- */

/** Die Form zeigt den Status, nicht nur die Farbe: Ring → halb → gefüllt mit Haken. */
export function StatusGlyph({ status, className = "size-3.5" }: { status: SubmissionStatus; className?: string }) {
  if (status === "completed")
    return (
      <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
        <circle cx="8" cy="8" r="7" className="fill-forest" />
        <path d="m5 8.2 2 2 4-4.2" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (status === "contacted")
    return (
      <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" fill="none" className="stroke-forest" strokeWidth="1.5" />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5Z" className="fill-forest" />
      </svg>
    );
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" fill="none" className="stroke-forest-soft" strokeWidth="1.5" />
    </svg>
  );
}

const pill = "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap";

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const tone = {
    open: "bg-white text-forest ring-1 ring-line ring-inset",
    contacted: "bg-sage-deep text-forest",
    completed: "bg-forest/8 text-forest",
  }[status];
  return (
    <span className={`${pill} ${tone}`}>
      <StatusGlyph status={status} />
      {SUBMISSION_STATUS_TITLE[status]}
    </span>
  );
}

export function ResultBadge({ outcome }: { outcome: Outcome | null }) {
  if (!outcome) return <span className={`${pill} border border-dashed border-line text-forest-soft`}>Kein Ergebnis</span>;
  const map = {
    qualified: { cls: "bg-ok-soft text-ok", Icon: CheckCircle },
    not_qualified: { cls: "bg-line-soft text-forest-soft", Icon: X },
    unreachable: { cls: "bg-warn-soft text-warn", Icon: PhoneOff },
  }[outcome];
  return (
    <span className={`${pill} ${map.cls}`}>
      <map.Icon className="size-3.5" />
      {OUTCOME_TITLE[outcome]}
    </span>
  );
}

/* ---------- Personen ---------- */

const AVATAR_TONES = [
  "bg-forest text-white",
  "bg-sage-deep text-forest",
  "bg-white text-forest ring-1 ring-line ring-inset",
  "bg-coral-soft text-coral-ink",
];

/** Farbe nach Position in der Team-Liste, nicht nach Name – so bekommt jedes neue Mitglied automatisch eine. */
export function Avatar({ name, index, size = "md" }: { name: string; index: number; size?: "sm" | "md" }) {
  const tone = AVATAR_TONES[(index < 0 ? 0 : index) % AVATAR_TONES.length];
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${tone} ${size === "sm" ? "size-5 text-[10px]" : "size-7 text-xs"}`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function UnassignedPill({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-coral-soft font-semibold whitespace-nowrap text-coral-ink ring-1 ring-coral/40 ring-inset ${
        size === "sm" ? "h-6 px-2.5 text-xs" : "h-7 px-3 text-[13px]"
      }`}
    >
      <span className="size-1.5 rounded-full bg-coral-strong" />
      Nicht zugewiesen
    </span>
  );
}

/* ---------- Fortschritt ---------- */

/** Ein Symbol pro Anfrage (älteste zuerst) und „x von y abgeschlossen“. */
export function Progress({ statuses }: { statuses: SubmissionStatus[] }) {
  const done = statuses.filter((s) => s === "completed").length;
  const all = done === statuses.length;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1" aria-hidden="true">
        {statuses.map((s, i) => (
          <StatusGlyph key={i} status={s} className="size-4" />
        ))}
      </div>
      <span className={`text-[13px] ${all ? "text-forest-soft" : "text-forest"}`}>
        {statuses.length === 1
          ? SUBMISSION_STATUS_TITLE[statuses[0]]
          : all
            ? `Alle ${statuses.length} abgeschlossen`
            : `${done} von ${statuses.length} abgeschlossen`}
      </span>
    </div>
  );
}

/* ---------- Rückmeldungen ---------- */

export type FeedbackTone = "ok" | "warn" | "error";
export type Feedback = { tone: FeedbackTone; text: string };

const feedbackTone: Record<FeedbackTone, { cls: string; Icon: typeof Alert; label: string }> = {
  ok: { cls: "bg-ok-soft text-ok", Icon: CheckCircle, label: "Erfolg" },
  warn: { cls: "bg-warn-soft text-warn", Icon: Alert, label: "Hinweis" },
  error: { cls: "bg-danger-soft text-danger", Icon: Alert, label: "Fehler" },
};

/** Meldung oben auf der Seite. `onDismiss` fehlt bei Meldungen aus der URL (Server Component), dann ohne Schließen-Knopf. */
export function FeedbackLine({ feedback, onDismiss }: { feedback: Feedback; onDismiss?: () => void }) {
  const t = feedbackTone[feedback.tone];
  return (
    <div role={feedback.tone === "error" ? "alert" : "status"} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${t.cls}`}>
      <t.Icon className="size-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">
        <span className="sr-only">{t.label}: </span>
        {feedback.text}
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Meldung schließen"
          className={`grid size-8 place-items-center rounded-lg hover:bg-white/60 ${focusRing}`}
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/* ---------- Bestätigungsmail ---------- */

type Confirmation = { confirmation_status: ConfirmationStatus; confirmation_sent_at: string | null; confirmation_error: string | null };

/** Versandstatus der Bestätigungsmail; Zeitpunkt bzw. Fehlergrund als Tooltip. */
export function MailStatusBadge({ intake }: { intake: Confirmation }) {
  const status = intake.confirmation_status;
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-danger" title={intake.confirmation_error ?? "unbekannter Fehler"}>
        <Alert className="size-4" /> Fehlgeschlagen
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-forest-soft" title="Versand noch nicht abgeschlossen">
        <Clock className="size-4" /> Ausstehend
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm text-forest-soft"
      title={intake.confirmation_sent_at ? `gesendet am ${formatBerlinDateTime(intake.confirmation_sent_at)}` : undefined}
    >
      <CheckCircle className="size-4" /> Gesendet
    </span>
  );
}

/* ---------- Sonstiges ---------- */

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-md bg-sage px-2 text-xs font-medium whitespace-nowrap text-forest-soft ${className}`}>
      {children}
    </span>
  );
}

/** Spalten der Kontaktliste (Kopf und Zeilen): Kontakt, Erreichbar, Zuständig, Fortschritt, Neueste Anfrage, Pfeil. */
export const CONTACT_COLS =
  "grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,0.95fr)_minmax(0,0.9fr)_1.25rem] items-center gap-6";

/** Weiße Karte mit Schatten, wie Liste, Prüffall und Analyse-Kacheln im Entwurf. */
export const cardClass = "rounded-2xl bg-white shadow-card ring-1 ring-line-soft";
