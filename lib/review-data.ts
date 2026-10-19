import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { groupMethods, summarizeHistory, toReviewCase, type Candidate, type ReviewCase } from "@/lib/review";

/**
 * Lädt die Prüffälle mit dem Session-Client. Kandidaten werden bei jedem Aufruf neu berechnet
 * (`intake_candidates` in SQL), weil sich die Kontakte seit dem Eingang geändert haben können.
 */
export async function fetchReviewCases(supabase: SupabaseClient): Promise<ReviewCase[]> {
  const { data: intakes, error } = await supabase
    .from("incoming_submissions")
    .select("id, received_at, payload, normalized_email, normalized_phone")
    .eq("status", "needs_review")
    .order("received_at");
  if (error) throw error;
  if (intakes.length === 0) return [];

  const candidatesByIntake = await Promise.all(
    intakes.map(async (intake) => {
      const { data, error: rpcError } = await supabase.rpc("intake_candidates", { p_intake_id: intake.id });
      if (rpcError) throw rpcError;
      return (data ?? []) as Candidate[];
    }),
  );

  const contactIds = [...new Set(candidatesByIntake.flat().map((c) => c.contact_id))];
  const { data: historyRows, error: historyError } = contactIds.length
    ? await supabase
        .from("submissions")
        .select("contact_id, created_at, street, house_number, postal_code, city")
        .in("contact_id", contactIds)
    : { data: [], error: null };
  if (historyError) throw historyError;
  const history = summarizeHistory(historyRows ?? []);

  const { data: methodRows, error: methodError } = contactIds.length
    ? await supabase.from("contact_methods").select("contact_id, type, normalized_value").in("contact_id", contactIds)
    : { data: [], error: null };
  if (methodError) throw methodError;
  const methods = groupMethods(methodRows ?? []);

  return intakes.map((intake, i) => toReviewCase(intake, candidatesByIntake[i], history, methods));
}
