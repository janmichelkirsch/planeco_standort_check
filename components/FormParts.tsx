import Image from "next/image";
import { Alert, ArrowRight, Spinner } from "@/components/icons";

/** Ablauf „So geht's weiter“ – gleiche Texte für Mobile und Desktop. */
export const STEPS = [
  { title: "Adresse angeben", text: "Nennen Sie uns die Lage Ihres Grundstücks und Ihre Kontaktdaten." },
  { title: "Standort wird geprüft", text: "Unser Team sieht sich Ihr Grundstück und Ihr Vorhaben an." },
  { title: "Wir melden uns", text: "Sie erhalten eine persönliche Rückmeldung zu den nächsten Schritten." },
];

// Die echte Datenschutz-URL ist noch nicht bekannt – bis dahin auf die Planeco-Website.
const PRIVACY_URL = "https://www.planecobuilding.de";

export function Logo({ className = "" }: { className?: string }) {
  // mix-blend-multiply blendet den weißen JPEG-Hintergrund in den Seitenton ein.
  return (
    <Image
      src="/images/planeco-logo.jpeg"
      alt="Planeco"
      width={1024}
      height={249}
      priority
      className={`w-auto mix-blend-multiply ${className}`}
    />
  );
}

export function SubmitButton({ submitting, className = "", form }: { submitting: boolean; className?: string; form?: string }) {
  return (
    <button
      type="submit"
      form={form}
      disabled={submitting}
      className={`group flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-coral px-6 text-base font-semibold text-white transition-colors hover:bg-coral-dark active:bg-coral-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest disabled:cursor-wait disabled:opacity-80 ${className}`}
    >
      {submitting ? (
        <>
          <Spinner className="size-5" /> Anfrage wird gesendet …
        </>
      ) : (
        <>
          Standort-Check anfragen
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

export function PrivacyNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-forest-soft ${className}`}>
      <span aria-hidden="true" className="text-coral-dark">
        *
      </span>{" "}
      Pflichtfeld. Ihre Angaben verwenden wir ausschließlich zur Bearbeitung Ihrer Anfrage. Mehr in der{" "}
      <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-forest underline underline-offset-2">
        Datenschutzerklärung
      </a>
      .
    </p>
  );
}

/** Meldung, wenn das Absenden technisch fehlschlägt. Die Eingaben bleiben erhalten. */
export function SubmitErrorBanner({ message, className = "" }: { message: string | null; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={`flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-3 text-[13px] leading-5 text-danger ${className}`}>
      <Alert className="mt-px size-4 shrink-0" />
      {message}
    </p>
  );
}

export function formatAddress(lead: { street: string; houseNumber: string; postalCode: string; city: string }) {
  return `${lead.street} ${lead.houseNumber}, ${lead.postalCode} ${lead.city}`;
}
