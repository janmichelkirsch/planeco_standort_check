"use client";

import { useEffect, useRef, useState } from "react";
import type { CountryCode } from "libphonenumber-js";
import {
  CONTACT_FIELDS,
  PROPERTY_FIELDS,
  leadSchema,
  toFieldErrors,
  type FieldErrors,
  type LeadField,
  type LeadInput,
} from "@/lib/lead-schema";
import type { AddressSuggestion } from "@/lib/photon";
import { loadTracking, type Tracking } from "@/lib/tracking";

/** Fehler-Schlüssel: alle Formularfelder plus `address` für das Suchfeld. */
export type ErrorKey = LeadField | "address";
export type FormErrors = Partial<Record<ErrorKey, string>>;
export type FormStep = "property" | "contact";

type TextField = (typeof PROPERTY_FIELDS)[number] | (typeof CONTACT_FIELDS)[number];
type Status = "idle" | "submitting" | "success";

const EMPTY_LEAD: LeadInput = {
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  addressSource: "manual",
  state: null,
  county: null,
  municipality: null,
  latitude: null,
  longitude: null,
  firstName: "",
  lastName: "",
  email: "",
  phoneCountry: "DE",
  phone: "",
};

// Reihenfolge, in der der erste Fehler den Fokus bekommt.
const FOCUS_ORDER: ErrorKey[] = ["address", ...PROPERTY_FIELDS, ...CONTACT_FIELDS];

function focusField(key: ErrorKey) {
  requestAnimationFrame(() => document.getElementById(key)?.focus());
}

/** UUID v4; `crypto.randomUUID` fehlt in älteren Browsern (Safari < 15.4). */
function newRequestId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Gemeinsamer Zustand für Mobile- und Desktop-Formular: Adresse (Suche oder Felder), Kontakt,
 * Prüfung pro Schritt mit Fehlern am Feld und das Absenden an `/api/lead`.
 */
export function useLeadForm() {
  const [lead, setLead] = useState<LeadInput>(EMPTY_LEAD);
  // "search": nur das Suchfeld. "fields": Adressfelder sichtbar (nach Vorschlag oder manuell).
  const [addressMode, setAddressMode] = useState<"search" | "fields">("search");
  const [query, setQueryState] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Kampagnen-Herkunft der Sitzung; bleibt auch bei „Weiteres Grundstück prüfen“ erhalten.
  const tracking = useRef<Tracking>({});
  // Idempotenz: Ein erneuter Versuch mit unveränderten Daten (z. B. nach Netzfehler) nutzt dieselbe ID.
  const lastAttempt = useRef<{ body: string; requestId: string } | null>(null);

  useEffect(() => {
    tracking.current = loadTracking();
  }, []);

  const clearErrors = (...keys: ErrorKey[]) =>
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });

  const setQuery = (value: string) => {
    setQueryState(value);
    clearErrors("address");
  };

  const selectSuggestion = (s: AddressSuggestion) => {
    setLead((prev) => ({
      ...prev,
      street: s.street,
      houseNumber: s.houseNumber,
      postalCode: s.postalCode,
      city: s.city,
      addressSource: "photon",
      state: s.state,
      county: s.county,
      municipality: s.municipality,
      latitude: s.latitude,
      longitude: s.longitude,
    }));
    setAddressMode("fields");
    clearErrors("address", ...PROPERTY_FIELDS);
    // Liefert Photon keine Hausnummer, direkt dorthin springen.
    if (!s.houseNumber) focusField("houseNumber");
  };

  const enterManual = () => {
    setAddressMode("fields");
    clearErrors("address");
    focusField("street");
  };

  const backToSearch = () => {
    setLead((prev) => ({
      ...prev,
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
      addressSource: "manual",
      state: null,
      county: null,
      municipality: null,
      latitude: null,
      longitude: null,
    }));
    setQueryState("");
    setAddressMode("search");
    clearErrors("address", ...PROPERTY_FIELDS);
  };

  const updateField = (field: TextField) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setLead((prev) => {
      const next = { ...prev, [field]: value };
      // Wer Straße, PLZ oder Ort einer übernommenen Adresse ändert, hat sie manuell eingegeben:
      // Bundesland und Koordinaten passen dann nicht mehr. Die Hausnummer ist ausgenommen – Photon liefert
      // oft nur die Straße, und Bundesland/Koordinaten (Straßenebene) bleiben beim Ergänzen gültig.
      const isAddressField = (PROPERTY_FIELDS as readonly string[]).includes(field) && field !== "houseNumber";
      if (isAddressField && prev.addressSource === "photon") {
        return { ...next, addressSource: "manual", state: null, county: null, municipality: null, latitude: null, longitude: null };
      }
      return next;
    });
    clearErrors(field);
  };

  const updatePhone = (next: { value: string; country: CountryCode }) => {
    setLead((prev) => ({ ...prev, phone: next.value, phoneCountry: next.country }));
    clearErrors("phone");
  };

  const computeErrors = (): FormErrors => {
    const result = leadSchema.safeParse(lead);
    const fieldErrors: FormErrors = result.success ? {} : toFieldErrors(result.error.issues);
    if (addressMode === "search") {
      // Ohne gewählten Vorschlag gibt es noch keine Adressfelder – der Fehler gehört ans Suchfeld.
      PROPERTY_FIELDS.forEach((k) => delete fieldErrors[k]);
      fieldErrors.address = query.trim()
        ? "Bitte wählen Sie eine Adresse aus den Vorschlägen aus."
        : "Bitte geben Sie die Adresse Ihres Grundstücks ein.";
    }
    return fieldErrors;
  };

  /** Prüft die Felder der angegebenen Schritte, zeigt deren Fehler und fokussiert den ersten. */
  const validate = (steps: FormStep[] = ["property", "contact"]): ErrorKey | null => {
    const keys: ErrorKey[] = [
      ...(steps.includes("property") ? (["address", ...PROPERTY_FIELDS] as ErrorKey[]) : []),
      ...(steps.includes("contact") ? CONTACT_FIELDS : []),
    ];
    const all = computeErrors();
    const scoped: FormErrors = {};
    keys.forEach((k) => {
      if (all[k]) scoped[k] = all[k];
    });
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return { ...next, ...scoped };
    });
    const first = FOCUS_ORDER.find((k) => scoped[k]) ?? null;
    if (first) focusField(first);
    return first;
  };

  /** Prüft alles und sendet. Gibt den ersten fehlerhaften Schlüssel zurück, sonst null. */
  const submit = async (): Promise<ErrorKey | null> => {
    if (status === "submitting") return null;
    setSubmitError(null);
    const first = validate();
    if (first) return first;

    setStatus("submitting");
    const body = JSON.stringify({ ...lead, ...tracking.current });
    const requestId = lastAttempt.current?.body === body ? lastAttempt.current.requestId : newRequestId();
    lastAttempt.current = { body, requestId };
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, ...tracking.current, clientRequestId: requestId }),
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok) {
        lastAttempt.current = null;
        setStatus("success");
        return null;
      }
      setStatus("idle");
      // Server lehnt Felder ab (sollte durch die gleiche Prüfung selten sein): am Feld anzeigen.
      if (response.status === 422 && result?.fieldErrors) {
        const serverErrors = result.fieldErrors as FieldErrors;
        setErrors((prev) => ({ ...prev, ...serverErrors }));
        const firstServer = FOCUS_ORDER.find((k) => serverErrors[k as LeadField]) ?? null;
        if (firstServer) focusField(firstServer);
        return firstServer;
      }
      setSubmitError("Ihre Anfrage konnte gerade nicht gesendet werden. Bitte versuchen Sie es noch einmal.");
      return null;
    } catch (error) {
      console.error("[useLeadForm] Senden fehlgeschlagen", error);
      setStatus("idle");
      setSubmitError("Keine Verbindung. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.");
      return null;
    }
  };

  const reset = () => {
    setLead(EMPTY_LEAD);
    setAddressMode("search");
    setQueryState("");
    setErrors({});
    setStatus("idle");
    setSubmitError(null);
  };

  return {
    lead,
    addressMode,
    query,
    errors,
    status,
    submitting: status === "submitting",
    submitError,
    setQuery,
    selectSuggestion,
    enterManual,
    backToSearch,
    updateField,
    updatePhone,
    validate,
    submit,
    reset,
  };
}

export type LeadFormState = ReturnType<typeof useLeadForm>;
