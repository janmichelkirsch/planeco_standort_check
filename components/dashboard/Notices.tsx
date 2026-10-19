"use client";

import Link from "next/link";
import { useTransition } from "react";
import { reprocessIntakesAction } from "@/app/admin/actions";
import { Alert, ArrowRight, Refresh, Users } from "@/components/icons";
import { useFeedback } from "@/components/dashboard/Feedback";
import { Popover, useAnchor } from "@/components/dashboard/Popover";
import { Button } from "@/components/dashboard/ui";

const noticeCls =
  "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

type Props = { needsReview: number; unprocessed: number; geocodeOpen: number };

const FAILED = "Erneut verarbeiten fehlgeschlagen. Bitte noch einmal versuchen.";

/**
 * Hinweise rechts neben der Begrüßung, nur wenn es etwas zu tun gibt (Spezifikation v3, §6.3):
 * Prüffälle → Prüfliste; nicht verarbeitete Eingänge und offene Adresssuchen → Popup mit „Erneut verarbeiten“.
 * Das Popup verhindert, dass ein versehentlicher Klick sofort alles neu verarbeitet.
 */
export function Notices({ needsReview, unprocessed, geocodeOpen }: Props) {
  const failures = unprocessed + geocodeOpen;
  if (needsReview === 0 && failures === 0) return null;
  return (
    <div className="flex shrink-0 items-center gap-2 pb-0.5" aria-label="Hinweise">
      {failures > 0 && <FailureNotice unprocessed={unprocessed} geocodeOpen={geocodeOpen} />}
      {needsReview > 0 && (
        <Link href="/admin/review" className={`${noticeCls} border-warn-line bg-warn-soft text-warn hover:border-warn`}>
          <Users className="size-4" />
          {needsReview === 1 ? "1 Anfrage wartet auf Prüfung" : `${needsReview} Anfragen warten auf Prüfung`}
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

function FailureNotice({ unprocessed, geocodeOpen }: { unprocessed: number; geocodeOpen: number }) {
  const { anchor, toggle, close } = useAnchor();
  const [pending, startTransition] = useTransition();
  const { showResult, showFailure } = useFeedback();
  const total = unprocessed + geocodeOpen;

  const retry = () =>
    startTransition(async () => {
      try {
        const { ok, result } = await reprocessIntakesAction();
        close(false);
        showResult(result, ok ? undefined : FAILED);
      } catch (error) {
        close(false);
        showFailure(error, "Erneut verarbeiten", FAILED);
      }
    });

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={!!anchor}
        onClick={(e) => toggle(e.currentTarget)}
        className={`${noticeCls} border-danger-line bg-danger-soft text-danger hover:border-danger`}
      >
        <Alert className="size-4" />
        {total} nicht verarbeitet
      </button>
      {anchor && (
        <Popover anchor={anchor} onClose={close} label="Nicht verarbeitet" className="w-80 p-4">
          <p className="text-sm font-semibold">Hier ist etwas hängen geblieben</p>
          <ul className="mt-1 space-y-1 text-[13px] leading-relaxed text-forest-soft">
            {unprocessed > 0 && (
              <li>
                {unprocessed === 1 ? "1 Anfrage ist" : `${unprocessed} Anfragen sind`} sicher gespeichert, aber noch keinem Kontakt
                zugeordnet.
              </li>
            )}
            {geocodeOpen > 0 && (
              <li>
                {geocodeOpen === 1 ? "1 Adresse konnte" : `${geocodeOpen} Adressen konnten`} noch nicht nachgeschlagen werden (Gemeinde und
                Bundesland fehlen).
              </li>
            )}
          </ul>
          <Button tone="primary" size="sm" className="mt-3 w-full" onClick={retry} disabled={pending}>
            <Refresh className={`size-4 ${pending ? "animate-spin" : ""}`} /> {pending ? "Wird verarbeitet …" : "Alles erneut verarbeiten"}
          </Button>
        </Popover>
      )}
    </>
  );
}
