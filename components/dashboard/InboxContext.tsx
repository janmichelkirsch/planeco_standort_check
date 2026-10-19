"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useFeedback } from "@/components/dashboard/Feedback";
import { inboxUrl, type Sort, type TeamMember, type View } from "@/lib/dashboard";
import type { ActionResult } from "@/lib/dashboard-forms";

type Inbox = { view: View; sort: Sort; me: string | null; members: TeamMember[] };

const InboxContext = createContext<Inbox | null>(null);

/** Was die Bedienelemente der Liste wissen müssen: aktuelle Ansicht/Sortierung (für den Rücksprung), wer ich bin, das Team. */
export function InboxProvider({ value, children }: { value: Inbox; children: ReactNode }) {
  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox(): Inbox & { nameOf: (id: string | null) => string | null; indexOf: (id: string) => number } {
  const inbox = useContext(InboxContext);
  if (!inbox) throw new Error("useInbox außerhalb von InboxProvider");
  return {
    ...inbox,
    nameOf: (id) => (id ? (inbox.members.find((m) => m.id === id)?.display_name ?? "unbekannt") : null),
    indexOf: (id) => inbox.members.findIndex((m) => m.id === id),
  };
}

/**
 * Führt eine Action aus, zeigt die Rückmeldung oben und merkt sich den Kontakt in der URL (`keep`/`open`),
 * damit er nach dem Neuladen sichtbar bleibt. `text` ersetzt den Standardtext bei Erfolg (z. B. mit Namen).
 */
export function useInboxAction() {
  const { view, sort } = useInbox();
  const router = useRouter();
  const { showResult, showFailure } = useFeedback();
  const [pending, startTransition] = useTransition();

  const run = (contactId: string, where: string, call: () => Promise<ActionResult>, text?: string, after?: (r: ActionResult) => void) =>
    startTransition(async () => {
      try {
        const r = await call();
        showResult(r.result, r.ok ? text : undefined);
        router.replace(inboxUrl(view, sort, contactId), { scroll: false });
        after?.(r);
      } catch (error) {
        showFailure(error, where);
        after?.({ ok: false, result: "error" });
      }
    });

  return { run, pending };
}
