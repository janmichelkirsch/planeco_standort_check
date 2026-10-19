import { getCountries, type CountryCode } from "libphonenumber-js";
import { z } from "zod";
import { DEFAULT_PHONE_COUNTRY, normalizePhone } from "@/lib/normalize";

const requiredText = (message: string) => z.string().trim().min(1, message).max(200, "Die Eingabe ist zu lang.");

const PHONE_COUNTRIES = getCountries() as [CountryCode, ...CountryCode[]];

/**
 * Kampagnen-Angabe aus der URL. Darf eine Anfrage nie scheitern lassen:
 * zu lang → gekürzt, leer → null, falscher Typ → null.
 */
const trackingText = z
  .string()
  .transform((value) => value.trim().slice(0, 500) || null)
  .nullish()
  .catch(null);

export const TRACKING_FIELDS = [
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "gclid",
  "fbclid",
  "landingPage",
  "referrer",
] as const;

const trackingShape = Object.fromEntries(TRACKING_FIELDS.map((field) => [field, trackingText])) as Record<
  (typeof TRACKING_FIELDS)[number],
  typeof trackingText
>;

/** Feldregeln einer Anfrage – gemeinsam genutzt von Formular (Prüfung pro Schritt) und Server-Route. */
export const leadSchema = z
  .object({
    street: requiredText("Bitte geben Sie die Straße ein."),
    houseNumber: requiredText("Bitte geben Sie die Hausnummer ein.").max(20, "Die Hausnummer ist zu lang."),
    postalCode: z.string().trim().regex(/^\d{5}$/, "Bitte 5-stellige PLZ eingeben."),
    city: requiredText("Bitte geben Sie den Ort ein."),
    addressSource: z.enum(["photon", "manual"]),
    // Nur gesetzt, wenn die Adresse aus einem Photon-Vorschlag stammt.
    state: z.string().trim().max(100).nullable(),
    county: z.string().trim().max(100).nullish(),
    municipality: z.string().trim().max(100).nullish(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),

    firstName: requiredText("Bitte geben Sie Ihren Vornamen ein."),
    lastName: requiredText("Bitte geben Sie Ihren Nachnamen ein."),
    email: z
      .string()
      .trim()
      .min(1, "Bitte geben Sie Ihre E-Mail-Adresse ein.")
      .pipe(z.email("Bitte prüfen Sie das Format, z. B. name@beispiel.de.")),
    // Land aus dem Vorwahl-Dropdown. Gilt nur für Nummern ohne eigene Ländervorwahl.
    phoneCountry: z.enum(PHONE_COUNTRIES, "Bitte wählen Sie ein Land.").default(DEFAULT_PHONE_COUNTRY),
    phone: z
      .string()
      .trim()
      .min(1, "Bitte geben Sie Ihre Telefonnummer ein.")
      .max(50, "Die Telefonnummer ist zu lang."),

    // Idempotenz: dieselbe ID bei Wiederholung desselben Absendens. Wird Pflicht, sobald das Formular sie mitschickt.
    clientRequestId: z.uuid().optional(),

    ...trackingShape,
  })
  .superRefine((lead, ctx) => {
    if (lead.phone && normalizePhone(lead.phone, lead.phoneCountry) === null) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Bitte prüfen Sie die Telefonnummer." });
    }
  });

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadField = keyof LeadInput;
export type FieldErrors = Partial<Record<LeadField, string>>;

export const PROPERTY_FIELDS = ["street", "houseNumber", "postalCode", "city"] as const satisfies LeadField[];
export const CONTACT_FIELDS = ["firstName", "lastName", "email", "phone"] as const satisfies LeadField[];

/** Erste Fehlermeldung pro Feld – Grundlage für die Anzeige direkt am Feld. */
export function toFieldErrors(issues: z.core.$ZodIssue[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as LeadField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
