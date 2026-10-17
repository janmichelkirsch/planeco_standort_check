"use client";

import { Field } from "@/components/Field";
import { ArrowLeft, Check } from "@/components/icons";
import type { LeadFormState } from "@/lib/use-lead-form";

type Props = {
  form: LeadFormState;
  /** Mobile: größere Klickflächen. */
  compact?: boolean;
};

/**
 * Bearbeitbare Adressfelder – nach Auswahl eines Vorschlags vorausgefüllt oder für die manuelle Eingabe leer.
 * Straße und Hausnummer bleiben getrennt (besser für Abgleich und Anreicherung).
 */
export function AddressFields({ form, compact }: Props) {
  const { lead, errors, submitting } = form;
  const fromSuggestion = lead.addressSource === "photon";

  return (
    <div className={compact ? "space-y-5" : "space-y-4"}>
      {fromSuggestion && (
        <p className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-[13px] leading-5 text-forest ${compact ? "bg-white/70" : "bg-sage"}`}>
          <Check className="mt-px size-4 shrink-0" />
          Adresse aus dem Vorschlag übernommen. Bitte kurz prüfen und bei Bedarf die Hausnummer ergänzen.
        </p>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-3">
        <Field
          id="street"
          label="Straße"
          autoComplete="address-line1"
          enterKeyHint="next"
          placeholder="z. B. Osterstraße"
          value={lead.street}
          onChange={form.updateField("street")}
          error={errors.street}
          disabled={submitting}
        />
        <Field
          id="houseNumber"
          label="Nr."
          autoComplete="off"
          enterKeyHint="next"
          value={lead.houseNumber}
          onChange={form.updateField("houseNumber")}
          error={errors.houseNumber}
          disabled={submitting}
        />
      </div>
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3">
        <Field
          id="postalCode"
          label="PLZ"
          inputMode="numeric"
          autoComplete="postal-code"
          enterKeyHint="next"
          maxLength={5}
          placeholder="20259"
          value={lead.postalCode}
          onChange={form.updateField("postalCode")}
          error={errors.postalCode}
          disabled={submitting}
        />
        <Field
          id="city"
          label="Ort"
          autoComplete="address-level2"
          enterKeyHint="next"
          placeholder="Hamburg"
          value={lead.city}
          onChange={form.updateField("city")}
          error={errors.city}
          disabled={submitting}
        />
      </div>
      <button
        type="button"
        onClick={form.backToSearch}
        disabled={submitting}
        className={`inline-flex items-center gap-1.5 font-medium text-forest underline underline-offset-4 hover:text-coral-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
          compact ? "min-h-11 text-sm" : "text-[13px]"
        }`}
      >
        <ArrowLeft className="size-4" /> {fromSuggestion ? "Andere Adresse suchen" : "Zurück zur Adresssuche"}
      </button>
    </div>
  );
}
