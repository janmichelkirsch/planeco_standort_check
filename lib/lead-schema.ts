import { z } from "zod";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} fehlt`).max(200, `${label} ist zu lang`);

/** Feldregeln einer Anfrage – gemeinsam genutzt von Formular und Server-Route. */
export const leadSchema = z.object({
  street: requiredText("Straße"),
  houseNumber: requiredText("Hausnummer"),
  postalCode: requiredText("PLZ"),
  city: requiredText("Ort"),
  addressSource: z.enum(["photon", "manual"]),
  state: z.string().trim().max(100).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),

  firstName: requiredText("Vorname"),
  lastName: requiredText("Nachname"),
  email: z.string().trim().pipe(z.email("E-Mail ist ungültig")),
  phone: z.string().trim().max(50, "Telefonnummer ist zu lang"),
});

export type LeadInput = z.infer<typeof leadSchema>;
