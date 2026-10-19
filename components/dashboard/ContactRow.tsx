"use client";

import { useState, type ReactNode } from "react";
import { Alert, Link as LinkIcon, PhoneCall } from "@/components/icons";
import { AssigneeMenu } from "@/components/dashboard/AssigneeMenu";
import { CONTACT_COLS, Progress, linkCls } from "@/components/dashboard/ui";
import type { SubmissionStatus } from "@/lib/dashboard";

export type ContactRowData = {
  id: string;
  name: string;
  ownerId: string | null;
  requestCount: number;
  autoMatched: boolean;
  issue: boolean;
  /** Telefon und Mail der neuesten Anfrage. */
  phone: { e164: string; display: string };
  email: string;
  /** Bearbeiter einzelner offener Anfragen, die nicht der Zuständige sind („+ Björn bei einzelnen Anfragen“). */
  alsoNames: string[];
  /** Älteste zuerst. */
  statuses: SubmissionStatus[];
  latestAt: string;
  latestCity: string;
};

/**
 * Eine Zeile pro Kontakt (Spezifikation v3, §8.2), aufklappbar zu Kontaktleiste und Anfragen (`children`).
 * Telefon, Mail und Zuständig-Menü sitzen in der Zeile; ihre Klicks klappen nicht auf.
 */
export function ContactRow({ data: c, initialOpen, children }: { data: ContactRowData; initialOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initialOpen);
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} id={`kontakt-${c.id}`} className="group scroll-mt-4">
      <summary
        className={`relative ${CONTACT_COLS} cursor-pointer list-none px-6 py-4 transition-colors outline-none hover:bg-sage/60 focus-visible:bg-sage/60 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-inset group-open:bg-sage/60 [&::-webkit-details-marker]:hidden`}
      >
        {!c.ownerId && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-coral-strong" />}

        <div className="min-w-0">
          <p className="flex items-center gap-2">
            <span className="line-clamp-2 font-semibold break-words" title={c.name}>
              {c.name}
            </span>
            {c.issue && (
              <span title="Enthält eine Anfrage mit Hinweis (Mail oder Adresse)" className="shrink-0 text-warn">
                <Alert className="size-4" />
                <span className="sr-only">Hinweis vorhanden</span>
              </span>
            )}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-forest-soft">
            {c.requestCount === 1 ? "1 Anfrage" : `${c.requestCount} Anfragen`}
            {c.autoMatched && (
              <span title="Person wurde automatisch wiedererkannt (Name, Mail und Telefon gleich)">
                <LinkIcon className="ml-1.5 inline size-3.5 align-[-2px]" />
                <span className="sr-only">Person wurde automatisch wiedererkannt</span>
              </span>
            )}
          </p>
        </div>

        <div className="min-w-0 text-sm">
          <a href={`tel:${c.phone.e164}`} onClick={stop} className={`inline-flex max-w-full items-center gap-1.5 ${linkCls} no-underline`}>
            <PhoneCall className="size-4 shrink-0 text-forest-soft" />
            <span className="truncate tabular-nums">{c.phone.display}</span>
          </a>
          <a
            href={`mailto:${c.email}`}
            onClick={stop}
            title={c.email}
            className="mt-1 block truncate text-[13px] text-forest-soft hover:text-forest hover:underline"
          >
            {c.email}
          </a>
        </div>

        <div className="min-w-0">
          <AssigneeMenu contactId={c.id} ownerId={c.ownerId} />
          {c.alsoNames.length > 0 && (
            <p className="mt-1 truncate text-[13px] text-forest-soft">+ {c.alsoNames.join(", ")} bei einzelnen Anfragen</p>
          )}
        </div>

        <Progress statuses={c.statuses} />

        <div className="min-w-0 text-sm">
          <p className="tabular-nums">{c.latestAt}</p>
          <p className="mt-0.5 truncate text-[13px] text-forest-soft">{c.latestCity}</p>
        </div>

        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 text-forest-soft transition-transform group-open:rotate-180">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="space-y-4 border-t border-line-soft bg-sage/60 px-6 pt-4 pb-6">{children}</div>
    </details>
  );
}
