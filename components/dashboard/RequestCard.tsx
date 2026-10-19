"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { saveSubmissionAction } from "@/app/admin/actions";
import { Alert, Chart, Check, ChevronDown, Link as LinkIcon, Mail, Pencil, PhoneCall, UserPlus } from "@/components/icons";
import { CampaignInfo } from "@/components/dashboard/CampaignInfo";
import { useFeedback } from "@/components/dashboard/Feedback";
import { useInbox } from "@/components/dashboard/InboxContext";
import { PlotInfo } from "@/components/dashboard/PlotInfo";
import { Menu, useAnchor, type MenuEntry } from "@/components/dashboard/Popover";
import { Avatar, MailStatusBadge, ResultBadge, Select, StatusBadge, linkCls } from "@/components/dashboard/ui";
import { effectiveAssignee, inboxUrl, type MatchStatus, type Outcome, type SubmissionRow, type SubmissionStatus } from "@/lib/dashboard";
import type { SubmissionPatch } from "@/lib/dashboard-forms";
import { OUTCOME_TITLE, SUBMISSION_STATUS_TITLE, formatBerlinDateTime } from "@/lib/format";
import { formatPhone } from "@/lib/phone-format";

type SaveState = "idle" | "saving" | "saved" | "error";
type Save = (patch: SubmissionPatch) => Promise<boolean>;

/**
 * Eine Anfrage im aufgeklappten Kontakt. Status, Ergebnis und Bearbeiter werden **sofort** gespeichert (kein Speichern-Knopf);
 * bei einem Fehler springt das Feld zurück. Offen, solange die Anfrage nicht abgeschlossen ist.
 */
export function RequestCard({ submission: s, index, total }: { submission: SubmissionRow; index: number; total: number }) {
  const { view, sort } = useInbox();
  const router = useRouter();
  const { showResult, showFailure } = useFeedback();
  const [open, setOpen] = useState(s.status !== "completed");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [, startTransition] = useTransition();
  const typedOtherName = s.submitted_first_name !== s.contact.first_name || s.submitted_last_name !== s.contact.last_name;

  useEffect(() => {
    if (saveState !== "saved") return;
    const t = window.setTimeout(() => setSaveState("idle"), 2000);
    return () => window.clearTimeout(t);
  }, [saveState]);

  const save: Save = (patch) =>
    new Promise((resolve) => {
      setSaveState("saving");
      startTransition(async () => {
        try {
          const r = await saveSubmissionAction(s.id, patch);
          setSaveState(r.ok ? "saved" : "error");
          if (r.ok) router.replace(inboxUrl(view, sort, s.contact.id), { scroll: false });
          else showResult(r.result);
          resolve(r.ok);
        } catch (error) {
          setSaveState("error");
          showFailure(error, "Anfrage speichern");
          resolve(false);
        }
      });
    });

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      aria-label={`Anfrage vom ${formatBerlinDateTime(s.created_at)}`}
      className="group/req overflow-hidden rounded-2xl bg-white ring-1 ring-line-soft"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 outline-none hover:bg-sage/40 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[13px] text-forest-soft">
            Anfrage {index}
            {total > 1 && <> von {total}</>}
            <MatchTag match={s.match_status} />
          </p>
          <p className="mt-0.5 font-semibold tabular-nums">{formatBerlinDateTime(s.created_at)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={s.status} />
          {s.outcome && <ResultBadge outcome={s.outcome} />}
          <HandlerMenu submission={s} save={save} />
        </div>
        <ChevronDown className="size-5 shrink-0 text-forest-soft transition-transform group-open/req:rotate-180" />
      </summary>

      <div className="grid grid-cols-[minmax(0,1fr)_17rem] border-t border-line-soft">
        <div className="min-w-0 space-y-4 p-5">
          <Section label="Grundstück">
            <PlotInfo plot={s} />
          </Section>

          <details className="group/an rounded-xl bg-sage/50">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium text-forest-soft outline-none hover:text-forest focus-visible:ring-2 focus-visible:ring-forest [&::-webkit-details-marker]:hidden">
              <Chart className="size-4" />
              Analytics
              <ChevronDown className="size-4 transition-transform group-open/an:rotate-180" />
            </summary>
            <div className="grid grid-cols-2 gap-6 px-3 pt-1 pb-3">
              <Section label="Herkunft">
                <CampaignInfo tracking={s} />
                <p className="mt-3 flex items-center gap-2 text-[13px] text-forest-soft">
                  Bestätigungsmail <MailStatusBadge intake={s.intake} />
                </p>
              </Section>
              <Section label="Kontaktdaten">
                <a href={`tel:${s.phone.normalized_value}`} className={`inline-flex items-center gap-1.5 text-sm tabular-nums ${linkCls}`}>
                  <PhoneCall className="size-4 shrink-0 text-forest-soft" />
                  {formatPhone(s.phone.normalized_value)}
                </a>
                <a href={`mailto:${s.email.normalized_value}`} className={`mt-2 flex min-w-0 items-center gap-1.5 text-sm ${linkCls}`}>
                  <Mail className="size-4 shrink-0 text-forest-soft" />
                  <span className="truncate" title={s.email.normalized_value}>
                    {s.email.normalized_value}
                  </span>
                </a>
                {typedOtherName && (
                  <p className="mt-2 text-[13px] text-forest-soft">
                    eingegeben als „{s.submitted_first_name} {s.submitted_last_name}“
                  </p>
                )}
              </Section>
            </div>
          </details>
        </div>

        <div className="flex flex-col gap-3 border-l border-line-soft bg-sage/50 p-5" aria-label="Anfrage bearbeiten" role="group">
          <SaveSelect
            key={`status-${s.status}`}
            id={`${s.id}-status`}
            label="Status"
            value={s.status}
            options={Object.entries(SUBMISSION_STATUS_TITLE)}
            onSave={(v) => save({ status: v as SubmissionStatus })}
          />
          <SaveSelect
            key={`outcome-${s.outcome ?? ""}`}
            id={`${s.id}-outcome`}
            label="Ergebnis"
            value={s.outcome ?? ""}
            options={[["", "Noch kein Ergebnis"], ...Object.entries(OUTCOME_TITLE)]}
            onSave={(v) => save({ outcome: v === "" ? null : (v as Outcome) })}
          />
          <SaveLine state={saveState} />
        </div>
      </div>
    </details>
  );
}

/** Auswahl, die beim Ändern speichert. `key` am Aufruf setzt sie nach dem Neuladen auf den Wert aus der Datenbank zurück. */
function SaveSelect({
  id,
  label,
  value: initial,
  options,
  onSave,
}: {
  id: string;
  label: string;
  value: string;
  options: [string, string][];
  onSave: (value: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState(initial);
  return (
    <Select
      id={id}
      label={label}
      value={value}
      onChange={async (e) => {
        const next = e.target.value;
        setValue(next);
        if (!(await onSave(next))) setValue(initial);
      }}
    >
      {options.map(([v, text]) => (
        <option key={v} value={v}>
          {text}
        </option>
      ))}
    </Select>
  );
}

function SaveLine({ state }: { state: SaveState }) {
  return (
    <p className="min-h-5 text-[13px]" role="status" aria-live="polite">
      {state === "saving" && <span className="text-forest-soft">Speichert …</span>}
      {state === "saved" && (
        <span className="inline-flex items-center gap-1 text-ok">
          <Check className="size-4" /> Gespeichert
        </span>
      )}
      {state === "error" && (
        <span className="inline-flex items-center gap-1 text-danger">
          <Alert className="size-4" /> Nicht gespeichert
        </span>
      )}
    </p>
  );
}

/** Wer diese Anfrage bearbeitet. Die zuständige Person wählen = kein abweichender Bearbeiter. Speichert sofort. */
function HandlerMenu({ submission: s, save }: { submission: SubmissionRow; save: Save }) {
  const { me, members, nameOf, indexOf } = useInbox();
  const { anchor, toggle, close } = useAnchor();
  const handler = effectiveAssignee(s);
  const owner = s.contact.account_owner_id;
  const label = (id: string) => (id === me ? `${nameOf(id)} (ich)` : (nameOf(id) ?? ""));

  const entries: MenuEntry[] = [
    { kind: "heading", label: owner ? `Zuständig für den Kontakt: ${nameOf(owner)}` : "Kontakt ist nicht zugewiesen" },
    ...members.map((m) => ({
      kind: "action" as const,
      label: m.id === owner ? `${label(m.id)} · zuständig` : label(m.id),
      icon: <Avatar name={m.display_name} index={indexOf(m.id)} size="sm" />,
      onSelect: () => {
        const override = m.id === owner ? null : m.id;
        if (override !== s.assigned_to_override) void save({ override });
      },
    })),
  ];

  return (
    <>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={!!anchor}
        title="Bearbeiter dieser Anfrage ändern"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(e.currentTarget);
        }}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full bg-white pr-2 pl-1 text-[13px] ring-1 ring-inset transition-shadow hover:ring-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
          anchor ? "ring-forest" : "ring-line-soft"
        }`}
      >
        {handler ? (
          <>
            <Avatar name={nameOf(handler) ?? "?"} index={indexOf(handler)} size="sm" />
            <span className="font-medium">{label(handler)}</span>
          </>
        ) : (
          <span className="pl-2 font-medium text-coral-ink">Nicht zugewiesen</span>
        )}
        <ChevronDown className="size-4 text-forest-soft" />
      </button>
      {anchor && <Menu anchor={anchor} label="Bearbeiter" entries={entries} onClose={close} />}
    </>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-medium text-forest-soft">{label}</p>
      {children}
    </div>
  );
}

const MATCH: Record<MatchStatus, { Icon: typeof LinkIcon; text: string }> = {
  new_contact_created: { Icon: UserPlus, text: "Neuer Kontakt" },
  auto_matched: { Icon: LinkIcon, text: "Automatisch zugeordnet (Name, Mail und Telefon gleich)" },
  manually_matched: { Icon: Pencil, text: "Manuell zugeordnet (Prüfliste)" },
};

function MatchTag({ match }: { match: MatchStatus }) {
  const { Icon, text } = MATCH[match];
  return (
    <span title={text} className="inline-grid size-6 place-items-center rounded-full bg-line-soft text-forest-soft">
      <Icon className="size-3.5" />
      <span className="sr-only">{text}</span>
    </span>
  );
}
