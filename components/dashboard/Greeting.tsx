import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "@/components/dashboard/ui";
import { formatBerlinLongDate, greetingFor } from "@/lib/format";

type Props = { now: Date; name: string; unassigned: number; myOpen: number; hasData: boolean };

/** Begrüßung mit Datum und dem, was heute ansteht. Beide Zahlen führen in den passenden Reiter. */
export function Greeting({ now, name, unassigned, myOpen, hasData }: Props) {
  return (
    <div>
      <p className="text-[13px] font-medium text-forest-soft">{formatBerlinLongDate(now)}</p>
      <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight">
        {greetingFor(now)}, {name}.
      </h1>
      <p className="mt-1.5 text-forest-soft">
        {!hasData ? (
          "Heute liegt nichts an."
        ) : (
          <>
            Heute:{" "}
            <InlineLink href="/admin?view=unassigned" accent={unassigned > 0}>
              {unassigned === 1 ? "1 Kontakt" : `${unassigned} Kontakte`} ohne Zuständigen
            </InlineLink>{" "}
            ·{" "}
            <InlineLink href="/admin?view=mine">{myOpen === 1 ? "1 offene Anfrage" : `${myOpen} offene Anfragen`} bei dir</InlineLink>
          </>
        )}
      </p>
    </div>
  );
}

function InlineLink({ href, accent, children }: { href: string; accent?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-sm font-semibold underline decoration-2 underline-offset-4 ${focusRing} ${
        accent ? "text-coral-ink decoration-coral/50 hover:decoration-coral-ink" : "text-forest decoration-line hover:decoration-forest"
      }`}
    >
      {children}
    </Link>
  );
}
