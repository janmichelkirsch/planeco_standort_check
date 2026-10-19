"use client";

import Image from "next/image";
import type { FormEvent, ReactNode } from "react";
import { AddressFields } from "@/components/AddressFields";
import { AddressSearch } from "@/components/AddressSearch";
import { Field } from "@/components/Field";
import { PhoneField } from "@/components/PhoneField";
import { Logo, PrivacyNote, STEPS, SubmitButton, SubmitErrorBanner, formatAddress } from "@/components/FormParts";
import { ArrowLeft, CheckCircle } from "@/components/icons";
import type { LeadFormState } from "@/lib/use-lead-form";

const WEBSITE_URL = "https://www.planecobuilding.de";

/** Desktop-Variante: links Nutzenversprechen und Ablauf, rechts das Formular in einer Karte (beide Abschnitte auf einmal). */
export function DesktopForm({ form: f }: { form: LeadFormState }) {
  const { lead, errors, submitting } = f;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const first = await f.submit();
    if (!first) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh bg-sage">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo className="h-7 sm:h-8" />
        <a
          href={WEBSITE_URL}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-forest hover:bg-sage-deep focus-visible:outline-2 focus-visible:outline-forest"
        >
          <ArrowLeft className="size-4" />
          Zurück zur Website
        </a>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 pt-4 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-16 lg:pt-10 lg:pb-24">
        <section className="lg:sticky lg:top-10 lg:self-start">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-forest uppercase">
            <span className="size-1.5 rounded-full bg-coral" /> Kostenlos & unverbindlich
          </p>
          <h1 className="text-[2.1rem] leading-[1.12] font-bold tracking-tight text-balance sm:text-5xl">
            Kostenloser <span className="text-coral">Standort-Check.</span>
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-forest">
            Geben Sie die Adresse Ihres Grundstücks und Ihre Kontaktdaten an. Unser Team meldet sich bei Ihnen.
          </p>

          <ol className="mt-10 hidden max-w-md space-y-6 lg:block">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="w-7 shrink-0 text-3xl leading-none font-semibold text-forest-muted/70">{i + 1}.</span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-forest-soft">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 hidden overflow-hidden rounded-2xl lg:block">
            <Image
              src="/images/standort-hero.jpg"
              alt="Bauplan mit Stift auf einem Holztisch"
              width={1200}
              height={800}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        </section>

        <section aria-label="Formular Standort-Check">
          {f.status === "success" ? (
            <Success name={lead.firstName} address={formatAddress(lead)} email={lead.email} onReset={f.reset} />
          ) : (
            <form
              noValidate
              onSubmit={onSubmit}
              aria-busy={submitting}
              className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-40px_rgba(34,64,59,0.35)] sm:p-9"
            >
              <FormSection index={1} title="Grundstück">
                {f.addressMode === "search" ? (
                  <AddressSearch
                    query={f.query}
                    onQueryChange={f.setQuery}
                    onSelect={f.selectSuggestion}
                    onManual={f.enterManual}
                    error={errors.address}
                    disabled={submitting}
                  />
                ) : (
                  <AddressFields form={f} />
                )}
              </FormSection>

              <div className="my-8 h-px bg-line-soft" />

              <FormSection index={2} title="Ihre Kontaktdaten">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="firstName"
                    label="Vorname"
                    autoComplete="given-name"
                    value={lead.firstName}
                    onChange={f.updateField("firstName")}
                    error={errors.firstName}
                    disabled={submitting}
                  />
                  <Field
                    id="lastName"
                    label="Nachname"
                    autoComplete="family-name"
                    value={lead.lastName}
                    onChange={f.updateField("lastName")}
                    error={errors.lastName}
                    disabled={submitting}
                  />
                  <Field
                    id="email"
                    label="E-Mail"
                    type="email"
                    autoComplete="email"
                    placeholder="name@beispiel.de"
                    value={lead.email}
                    onChange={f.updateField("email")}
                    error={errors.email}
                    disabled={submitting}
                    className="sm:col-span-2"
                  />
                  <PhoneField
                    placeholder="040 123456"
                    hint="Für eine schnelle Rückfrage zu Ihrem Grundstück."
                    value={lead.phone}
                    country={lead.phoneCountry}
                    onChange={f.updatePhone}
                    error={errors.phone}
                    disabled={submitting}
                    className="sm:col-span-2"
                  />
                </div>
              </FormSection>

              <SubmitErrorBanner message={f.submitError} className="mt-9" />
              <SubmitButton submitting={submitting} className={f.submitError ? "mt-4" : "mt-9"} />
              <PrivacyNote className="mt-4 text-center" />
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function FormSection({ index, title, children }: { index: number; title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-5 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-sage text-sm font-semibold text-forest">{index}</span>
        <span className="text-xl font-semibold tracking-tight">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

function Success({ name, address, email, onReset }: { name: string; address: string; email: string; onReset: () => void }) {
  return (
    <div role="status" className="rounded-3xl bg-white p-7 text-center shadow-[0_30px_60px_-40px_rgba(34,64,59,0.35)] sm:p-10">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-sage text-forest">
        <CheckCircle className="size-8" />
      </span>
      <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        Vielen Dank, <span className="text-coral">{name}!</span>
      </h2>
      <p className="mx-auto mt-3 max-w-sm leading-relaxed text-forest-soft">
        Ihre Anfrage ist bei uns eingegangen. Unser Team meldet sich bei Ihnen unter{" "}
        <span className="font-medium text-forest">{email}</span>.
      </p>
      <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-sage p-4 text-left">
        <p className="text-xs font-semibold tracking-wide text-forest-soft uppercase">Ihr Grundstück</p>
        <p className="mt-1 font-medium">{address}</p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl border border-forest px-5 text-sm font-semibold text-forest hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        Weiteres Grundstück prüfen
      </button>
    </div>
  );
}
