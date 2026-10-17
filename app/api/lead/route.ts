import { leadSchema } from "@/lib/lead-schema";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Nimmt eine Standort-Check-Anfrage entgegen: prüfen → speichern → Antwort. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ungültige Anfrage" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.issues.map((issue) => issue.message);
    return Response.json({ ok: false, error: "Eingaben unvollständig", fieldErrors }, { status: 422 });
  }

  const lead = parsed.data;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("leads")
      .insert({
        street: lead.street,
        house_number: lead.houseNumber,
        postal_code: lead.postalCode,
        city: lead.city,
        address_source: lead.addressSource,
        state: lead.state,
        latitude: lead.latitude,
        longitude: lead.longitude,
        first_name: lead.firstName,
        last_name: lead.lastName,
        email: lead.email,
        phone: lead.phone || null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return Response.json({ ok: true, id: data.id }, { status: 201 });
  } catch (error) {
    console.error("[api/lead] Speichern fehlgeschlagen", error);
    return Response.json({ ok: false, error: "Speichern fehlgeschlagen" }, { status: 500 });
  }
}
