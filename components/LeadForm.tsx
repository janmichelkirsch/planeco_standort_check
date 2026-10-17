"use client";

import type { FormEvent } from "react";
import { AddressFields } from "@/components/AddressFields";
import { AddressSearch } from "@/components/AddressSearch";
import { Field } from "@/components/Field";
import { useLeadForm } from "@/lib/use-lead-form";

/** Übergangsversion: nutzt den gemeinsamen Hook, Optik wird in den nächsten Schritten ersetzt. */
export function LeadForm() {
  const f = useLeadForm();
  const { lead, errors, submitting } = f;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await f.submit();
  }

  if (f.status === "success") {
    return (
      <div className="rounded border border-green-600 p-4">
        <h2 className="text-lg font-semibold">Vielen Dank!</h2>
        <p>Ihre Anfrage ist eingegangen. Wir melden uns in Kürze bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-lg font-semibold">Grundstück</legend>
        {f.addressMode === "search" ? (
          <AddressSearch
            query={f.query}
            onQueryChange={f.setQuery}
            onSelect={f.selectSuggestion}
            onManual={f.enterManual}
            error={errors.address}
          />
        ) : (
          <AddressFields form={f} />
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-lg font-semibold">Ihre Kontaktdaten</legend>
        <Field id="firstName" label="Vorname" value={lead.firstName} onChange={f.updateField("firstName")} error={errors.firstName} />
        <Field id="lastName" label="Nachname" value={lead.lastName} onChange={f.updateField("lastName")} error={errors.lastName} />
        <Field id="email" label="E-Mail" type="email" value={lead.email} onChange={f.updateField("email")} error={errors.email} />
        <Field id="phone" label="Telefon" type="tel" value={lead.phone} onChange={f.updateField("phone")} error={errors.phone} />
      </fieldset>

      {f.submitError && <p className="text-sm text-danger">{f.submitError}</p>}

      <button type="submit" disabled={submitting} className="rounded bg-zinc-900 px-4 py-3 text-base font-semibold text-white disabled:opacity-50">
        {submitting ? "Wird gesendet …" : "Standort-Check anfragen"}
      </button>
    </form>
  );
}
