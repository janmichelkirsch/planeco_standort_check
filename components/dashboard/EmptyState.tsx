import Link from "next/link";
import { CheckCircle, Inbox } from "@/components/icons";
import { buttonClass } from "@/components/dashboard/ui";
import type { View } from "@/lib/dashboard";

const COPY: Record<View, { title: string; text: string; done: boolean }> = {
  open: { title: "Alles abgearbeitet", text: "Kein Kontakt hat mehr offene Anfragen.", done: true },
  unassigned: { title: "Alle Kontakte haben einen Zuständigen", text: "Neue Personen erscheinen hier, bis jemand sie übernimmt.", done: true },
  mine: { title: "Dir ist gerade nichts zugewiesen", text: "Übernimm einen Kontakt, um loszulegen.", done: false },
  all: { title: "Noch keine Anfragen", text: "Sobald jemand den Standort-Check abschickt, erscheint die Person hier.", done: false },
};

/** Leere Liste: je Reiter ein eigener Text; ganz ohne Daten der Hinweis, dass noch nichts eingegangen ist. */
export function EmptyState({ view, noData, unassigned }: { view: View; noData: boolean; unassigned: number }) {
  const copy = noData ? COPY.all : COPY[view];
  const Icon = copy.done ? CheckCircle : Inbox;
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-line-soft">
      <span className="grid size-14 place-items-center rounded-full bg-sage text-forest">
        <Icon className="size-7" />
      </span>
      <p className="mt-4 text-lg font-semibold">{copy.title}</p>
      <p className="mt-1 max-w-sm text-sm text-forest-soft">{copy.text}</p>
      {view === "mine" && !noData && unassigned > 0 && (
        <Link href="/admin?view=unassigned" className={buttonClass("primary", "md", "mt-6")}>
          {unassigned} nicht zugewiesene ansehen
        </Link>
      )}
    </div>
  );
}
