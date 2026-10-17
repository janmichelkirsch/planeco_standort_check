import { LeadForm } from "@/components/LeadForm";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Kostenloser Standort-Check</h1>
      <p className="mb-6 text-zinc-600">
        Geben Sie die Adresse Ihres Grundstücks und Ihre Kontaktdaten an. Unser Team meldet sich bei Ihnen.
      </p>
      <LeadForm />
    </main>
  );
}
