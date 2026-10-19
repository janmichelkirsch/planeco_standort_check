import { after } from "next/server";
import { processIntake, storeIntake } from "@/lib/intake";
import { toIntakeRow } from "@/lib/intake-row";
import { leadSchema, toFieldErrors } from "@/lib/lead-schema";
import { sendConfirmation } from "@/lib/mail/send-confirmation";

/**
 * Nimmt eine Standort-Check-Anfrage entgegen (Spezifikation v3, §5.2):
 * prüfen → normalisieren → Eingang speichern → Antwort → danach Bestätigungsmail und Zuordnung zum Kontakt.
 * Beides läuft per after() erst nach der Antwort und unabhängig voneinander; ein Fehler darin ändert die Antwort nie.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ungültige Anfrage" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error.issues);
    return Response.json({ ok: false, error: "Eingaben unvollständig", fieldErrors }, { status: 422 });
  }

  const lead = parsed.data;
  // Das Schema prüft die Nummer bereits; hier nur, falls beide Prüfungen je auseinanderlaufen.
  const row = toIntakeRow(lead, () => crypto.randomUUID());
  if (!row) {
    return Response.json(
      { ok: false, error: "Eingaben unvollständig", fieldErrors: { phone: "Bitte prüfen Sie die Telefonnummer." } },
      { status: 422 },
    );
  }

  try {
    const { id, created } = await storeIntake(row);
    // Wiederholter Versuch desselben Absendens: keine zweite Mail. Die Zuordnung ist idempotent und holt
    // einen zuvor abgebrochenen Eingang nach.
    if (created) after(() => sendConfirmation(id, lead));
    after(() => processIntake(id));
    return Response.json({ ok: true, id }, { status: created ? 201 : 200 });
  } catch (error) {
    console.error("[api/lead] Speichern fehlgeschlagen", error);
    return Response.json({ ok: false, error: "Speichern fehlgeschlagen" }, { status: 500 });
  }
}
