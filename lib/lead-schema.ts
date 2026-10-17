import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message).max(200, "Die Eingabe ist zu lang.");

/** Feldregeln einer Anfrage – gemeinsam genutzt von Formular (Prüfung pro Schritt) und Server-Route. */
export const leadSchema = z.object({
  street: requiredText("Bitte geben Sie die Straße ein."),
  houseNumber: requiredText("Bitte geben Sie die Hausnummer ein.").max(20, "Die Hausnummer ist zu lang."),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Bitte 5-stellige PLZ eingeben."),
  city: requiredText("Bitte geben Sie den Ort ein."),
  addressSource: z.enum(["photon", "manual"]),
  state: z.string().trim().max(100).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),

  firstName: requiredText("Bitte geben Sie Ihren Vornamen ein."),
  lastName: requiredText("Bitte geben Sie Ihren Nachnamen ein."),
  email: z
    .string()
    .trim()
    .min(1, "Bitte geben Sie Ihre E-Mail-Adresse ein.")
    .pipe(z.email("Bitte prüfen Sie das Format, z. B. name@beispiel.de.")),
  // Grobe Formatprüfung. Die Normalisierung auf E.164 folgt mit dem neuen Datenmodell.
  phone: z
    .string()
    .trim()
    .min(1, "Bitte geben Sie Ihre Telefonnummer ein.")
    .max(50, "Die Telefonnummer ist zu lang.")
    .regex(/^[+\d][\d\s/()-]{5,}$/, "Bitte prüfen Sie die Telefonnummer."),
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
