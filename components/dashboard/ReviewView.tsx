import Link from "next/link";
import { ArrowLeft, CheckCircle } from "@/components/icons";
import { ReviewCase } from "@/components/dashboard/ReviewCase";
import { FeedbackLine, buttonClass, type Feedback } from "@/components/dashboard/ui";
import type { ReviewCase as Case } from "@/lib/review";

/** Inhalt der Prüfliste ohne Laden (die Seite lädt, die lokale Vorschau setzt Beispieldaten ein). */
export function ReviewView({ cases, message }: { cases: Case[]; message: Feedback | null }) {
  return (
    <div>
      {message && (
        <div className="mb-6">
          <FeedbackLine feedback={message} />
        </div>
      )}
      <Link href="/admin" className={buttonClass("ghost", "sm", "-ml-3")}>
        <ArrowLeft className="size-4" /> Zurück zu den Anfragen
      </Link>

      <div className="mt-4">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">Prüfliste</h1>
        <p className="mt-1.5 max-w-2xl text-forest-soft">
          {cases.length === 0 ? "Alles geprüft." : cases.length === 1 ? "1 Anfrage wartet auf deine Entscheidung." : `${cases.length} Anfragen warten auf deine Entscheidung.`}{" "}
          Automatisch zusammengeführt wird nur, wenn Name, Mail und Telefon übereinstimmen. Alles andere entscheidet ein Mensch. Der eingegebene Name
          bleibt an der Anfrage gespeichert.
        </p>
      </div>

      {cases.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-line-soft">
          <span className="grid size-14 place-items-center rounded-full bg-ok-soft text-ok">
            <CheckCircle className="size-7" />
          </span>
          <p className="mt-4 text-lg font-semibold">Keine offenen Prüffälle</p>
          <p className="mt-1 text-sm text-forest-soft">Neue unklare Fälle erscheinen oben im Dashboard als Hinweis.</p>
          <Link href="/admin" className={buttonClass("primary", "md", "mt-6")}>
            Zu den Anfragen
          </Link>
        </div>
      ) : (
        <ol className="mt-8 space-y-6">
          {cases.map((c, i) => (
            <li key={c.id}>
              <ReviewCase review={c} index={i + 1} total={cases.length} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
