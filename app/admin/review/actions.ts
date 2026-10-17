"use server";

import { redirect } from "next/navigation";
import { requireSalesUser } from "@/lib/auth";
import { geocodeForIntake } from "@/lib/geocode";
import { parseResolveForm, resultForErrorCode, type ResultKey } from "@/lib/review";

/**
 * Entscheidung aus der Prüfliste: Eingang einem Kontakt zuordnen oder neuen Kontakt anlegen.
 * Läuft mit dem Session-Client; `resolve_intake_review` prüft selbst, ob der Nutzer ein Team-Mitglied ist,
 * und lehnt bereits bearbeitete Eingänge ab (P0409). Wer entschieden hat, wird bewusst nicht gespeichert.
 */
export async function resolveReview(formData: FormData) {
  const { supabase } = await requireSalesUser();
  const request = parseResolveForm(formData);

  let result: ResultKey;
  if (!request) {
    result = "invalid";
  } else {
    const { error } = await supabase.rpc(
      "resolve_intake_review",
      request.action === "create_new"
        ? { p_intake_id: request.intakeId, p_action: "create_new" }
        : {
            p_intake_id: request.intakeId,
            p_action: "attach_existing",
            p_contact_id: request.contactId,
            p_first_name: request.firstName,
            p_last_name: request.lastName,
          },
    );
    if (error) console.error("[admin/review] Entscheidung nicht gespeichert", error.code, error.message);
    result = error ? resultForErrorCode(error.code) : request.action === "create_new" ? "created" : "attached";
    // Manuell eingegebene Adresse jetzt nachschlagen (mit Secret Key: eingeloggte Nutzer dürfen submissions nicht direkt ändern).
    if (!error) await geocodeForIntake(request.intakeId);
  }
  redirect(`/admin/review?result=${result}`);
}
