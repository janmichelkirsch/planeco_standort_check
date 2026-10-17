"use client";

import { useState, type FormEvent } from "react";
import { AddressSearch } from "@/components/AddressSearch";
import type { AddressSuggestion } from "@/lib/photon";
import type { LeadInput } from "@/lib/lead-schema";

type TextField = "street" | "houseNumber" | "postalCode" | "city" | "firstName" | "lastName" | "email" | "phone";
const ADDRESS_FIELDS: TextField[] = ["street", "houseNumber", "postalCode", "city"];

const EMPTY_LEAD: LeadInput = {
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  addressSource: "manual",
  state: null,
  latitude: null,
  longitude: null,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string; details?: string[] };

export function LeadForm() {
  const [lead, setLead] = useState<LeadInput>(EMPTY_LEAD);
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });

  function applySuggestion(s: AddressSuggestion) {
    setLead((prev) => ({
      ...prev,
      street: s.street,
      houseNumber: s.houseNumber,
      postalCode: s.postalCode,
      city: s.city,
      addressSource: "photon",
      state: s.state,
      latitude: s.latitude,
      longitude: s.longitude,
    }));
    setShowAddressFields(true);
  }

  function updateField(field: TextField, value: string) {
    setLead((prev) => {
      const next = { ...prev, [field]: value };
      // Wer eine übernommene Adresse ändert, hat sie manuell eingegeben: Koordinaten passen dann nicht mehr.
      if (ADDRESS_FIELDS.includes(field) && prev.addressSource === "photon") {
        return { ...next, addressSource: "manual", state: null, latitude: null, longitude: null };
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmit({ kind: "sending" });
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        setSubmit({
          kind: "error",
          message: result?.error ?? "Senden fehlgeschlagen. Bitte noch einmal versuchen.",
          details: result?.fieldErrors,
        });
        return;
      }
      setSubmit({ kind: "success" });
    } catch (error) {
      console.error("[LeadForm] Senden fehlgeschlagen", error);
      setSubmit({ kind: "error", message: "Keine Verbindung. Bitte noch einmal versuchen." });
    }
  }

  if (submit.kind === "success") {
    return (
      <div className="rounded border border-green-600 p-4">
        <h2 className="text-lg font-semibold">Vielen Dank!</h2>
        <p>Ihre Anfrage ist eingegangen. Wir melden uns in Kürze bei Ihnen.</p>
      </div>
    );
  }

  const textInput = (field: TextField, label: string, type = "text", autoComplete?: string) => (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={lead[field]}
        onChange={(e) => updateField(field, e.target.value)}
        className="rounded border border-zinc-400 px-3 py-3 text-base"
      />
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-lg font-semibold">Grundstück</legend>
        <AddressSearch onSelect={applySuggestion} onManual={() => setShowAddressFields(true)} />
        {showAddressFields && (
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">{textInput("street", "Straße", "text", "address-line1")}</div>
            {textInput("houseNumber", "Nr.")}
            {textInput("postalCode", "PLZ", "text", "postal-code")}
            <div className="col-span-2">{textInput("city", "Ort", "text", "address-level2")}</div>
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-lg font-semibold">Ihre Kontaktdaten</legend>
        {textInput("firstName", "Vorname", "text", "given-name")}
        {textInput("lastName", "Nachname", "text", "family-name")}
        {textInput("email", "E-Mail", "email", "email")}
        {textInput("phone", "Telefon", "tel", "tel")}
      </fieldset>

      {submit.kind === "error" && (
        <div className="rounded border border-red-600 p-3 text-sm text-red-700">
          <p>{submit.message}</p>
          {submit.details && (
            <ul className="list-disc pl-5">
              {submit.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={submit.kind === "sending"}
        className="rounded bg-zinc-900 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
      >
        {submit.kind === "sending" ? "Wird gesendet …" : "Standort-Check anfragen"}
      </button>
    </form>
  );
}
