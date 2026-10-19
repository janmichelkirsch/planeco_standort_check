"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AddressFields } from "@/components/AddressFields";
import { AddressSearch } from "@/components/AddressSearch";
import { Field } from "@/components/Field";
import { PhoneField } from "@/components/PhoneField";
import { Logo, PrivacyNote, STEPS, SubmitButton, SubmitErrorBanner, formatAddress } from "@/components/FormParts";
import { ArrowLeft, ArrowRight, CheckCircle, Pencil, Pin } from "@/components/icons";
import { PROPERTY_FIELDS } from "@/lib/lead-schema";
import type { ErrorKey, LeadFormState } from "@/lib/use-lead-form";

const FORM_ID = "standort-check-mobile";
const PROPERTY_KEYS: ErrorKey[] = ["address", ...PROPERTY_FIELDS];

/**
 * Handy-Variante: eine Frage pro Bildschirm, Aktionsleiste unten in Daumenreichweite,
 * Vorschläge im Seitenfluss (nicht hinter der Tastatur), 16px-Eingaben.
 */
export function MobileForm({ form: f }: { form: LeadFormState }) {
  const { lead, errors, submitting } = f;
  const [step, setStep] = useState<1 | 2>(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const done = f.status === "success";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step, done]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!f.validate(["property"])) setStep(2);
      return;
    }
    const first = await f.submit();
    if (first && PROPERTY_KEYS.includes(first)) setStep(1);
  };

  return (
    <div className="flex h-dvh flex-col bg-sage text-forest">
      <header className="shrink-0 px-5 pt-[max(env(safe-area-inset-top),14px)] pb-3">
        <div className="flex h-11 items-center gap-2">
          {step === 2 && !done ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              aria-label="Zurück zum Grundstück"
              className="-ml-2.5 grid size-11 place-items-center rounded-full text-forest active:bg-sage-deep focus-visible:outline-2 focus-visible:outline-forest"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : null}
          <Logo className="h-6" />
          {!done && (
            <span className="ml-auto text-[13px] font-medium text-forest-soft" aria-live="polite">
              Schritt {step} von 2
            </span>
          )}
        </div>
        {!done && (
          <div className="mt-2 grid grid-cols-2 gap-1.5" aria-hidden="true">
            <span className="h-1 rounded-full bg-coral" />
            <span className={`h-1 rounded-full transition-colors duration-300 ${step === 2 ? "bg-coral" : "bg-sage-deep"}`} />
          </div>
        )}
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {done ? (
          <div role="status" className="flex min-h-full flex-col px-5 pt-10 pb-8">
            <span className="grid size-16 place-items-center rounded-full bg-white text-forest">
              <CheckCircle className="size-8" />
            </span>
            <h1 className="mt-6 text-[28px] leading-[1.15] font-bold tracking-tight">
              Vielen Dank, <span className="text-coral">{lead.firstName}!</span>
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-forest-soft">
              Ihre Anfrage ist bei uns eingegangen. Unser Team meldet sich bei Ihnen unter{" "}
              <span className="font-medium break-all text-forest">{lead.email}</span>.
            </p>
            <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white p-4">
              <Pin className="size-5 shrink-0 text-forest-soft" />
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-forest-soft uppercase">Ihr Grundstück</p>
                <p className="mt-0.5 font-medium">{formatAddress(lead)}</p>
              </div>
            </div>
          </div>
        ) : (
          <form id={FORM_ID} noValidate onSubmit={onSubmit} aria-busy={submitting} className="px-5 pt-5 pb-8">
            {step === 1 ? (
              <>
                <p className="text-xs font-semibold tracking-wide text-coral-dark uppercase">Kostenloser Standort-Check</p>
                <h1 className="mt-2 text-[28px] leading-[1.15] font-bold tracking-tight">
                  Wo liegt Ihr <span className="text-coral">Grundstück?</span>
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-forest-soft">
                  Geben Sie die Adresse ein. Im nächsten Schritt folgen Ihre Kontaktdaten.
                </p>

                <div className="mt-7">
                  {f.addressMode === "search" ? (
                    <AddressSearch
                      inline
                      query={f.query}
                      onQueryChange={f.setQuery}
                      onSelect={f.selectSuggestion}
                      onManual={f.enterManual}
                      error={errors.address}
                    />
                  ) : (
                    <AddressFields form={f} compact />
                  )}
                </div>

                <section className="mt-9 rounded-2xl bg-white/70 p-5" aria-labelledby="next-steps">
                  <h2 id="next-steps" className="text-sm font-semibold">
                    So geht&apos;s weiter
                  </h2>
                  <ol className="mt-4 space-y-4">
                    {STEPS.map((s, i) => (
                      <li key={s.title} className="flex gap-3">
                        <span className="w-5 shrink-0 text-xl leading-none font-semibold text-forest-muted/70">{i + 1}.</span>
                        <div>
                          <p className="text-sm font-semibold">{s.title}</p>
                          <p className="mt-0.5 text-[13px] leading-relaxed text-forest-soft">{s.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </>
            ) : (
              <>
                <h1 className="text-[28px] leading-[1.15] font-bold tracking-tight">
                  Wie erreichen <span className="text-coral">wir Sie?</span>
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-forest-soft">
                  Unser Team meldet sich bei Ihnen zum Standort-Check.
                </p>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left active:bg-sage-deep focus-visible:outline-2 focus-visible:outline-forest"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest text-white">
                    <Pin className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-forest-soft">Grundstück</span>
                    <span className="block truncate text-[15px] font-medium">{formatAddress(lead)}</span>
                  </span>
                  <Pencil className="size-5 shrink-0 text-forest-soft" />
                  <span className="sr-only">Ändern</span>
                </button>

                <div className="mt-7 space-y-5">
                  <Field
                    id="firstName"
                    label="Vorname"
                    autoComplete="given-name"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    value={lead.firstName}
                    onChange={f.updateField("firstName")}
                    error={errors.firstName}
                    disabled={submitting}
                  />
                  <Field
                    id="lastName"
                    label="Nachname"
                    autoComplete="family-name"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    value={lead.lastName}
                    onChange={f.updateField("lastName")}
                    error={errors.lastName}
                    disabled={submitting}
                  />
                  <Field
                    id="email"
                    label="E-Mail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    placeholder="name@beispiel.de"
                    value={lead.email}
                    onChange={f.updateField("email")}
                    error={errors.email}
                    disabled={submitting}
                  />
                  <PhoneField
                    enterKeyHint="send"
                    placeholder="040 123456"
                    hint="Für eine schnelle Rückfrage zu Ihrem Grundstück."
                    value={lead.phone}
                    country={lead.phoneCountry}
                    onChange={f.updatePhone}
                    error={errors.phone}
                    disabled={submitting}
                  />
                </div>
                <PrivacyNote className="mt-6" />
              </>
            )}
          </form>
        )}
      </div>

      <footer className="shrink-0 border-t border-line-soft bg-white px-5 pt-3 pb-[max(env(safe-area-inset-bottom),14px)]">
        {done ? (
          <button
            type="button"
            onClick={() => {
              f.reset();
              setStep(1);
            }}
            className="flex h-14 w-full items-center justify-center rounded-xl border border-forest text-base font-semibold text-forest active:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Weiteres Grundstück prüfen
          </button>
        ) : step === 1 ? (
          <button
            type="submit"
            form={FORM_ID}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-coral text-base font-semibold text-white active:bg-coral-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest"
          >
            Weiter zu den Kontaktdaten
            <ArrowRight className="size-5" />
          </button>
        ) : (
          <>
            {/* In der Aktionsleiste, damit die Meldung direkt beim Button sichtbar ist und nicht unterhalb des Scrollbereichs. */}
            <SubmitErrorBanner message={f.submitError} className="mb-3" />
            <SubmitButton form={FORM_ID} submitting={submitting} />
          </>
        )}
      </footer>
    </div>
  );
}
