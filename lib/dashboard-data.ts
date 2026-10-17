import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IntakeRef, SubmissionRow, TeamMember } from "@/lib/dashboard";
import type { UnresolvedIntakeInput } from "@/lib/export-rows";

/**
 * Lädt die Dashboard-Daten mit dem Session-Client (RLS: nur eingeloggte Nutzer lesen).
 * Supabase liefert höchstens 1000 Zeilen pro Abfrage, daher seitenweise.
 */

const PAGE_SIZE = 1000;

// E-Mail und Telefon hängen über zwei Fremdschlüssel an contact_methods; der Constraint-Name sagt, welcher gemeint ist.
const SUBMISSION_SELECT = `
  *,
  email:contact_methods!submissions_email_same_contact_fk(normalized_value),
  phone:contact_methods!submissions_phone_same_contact_fk(normalized_value),
  intake:incoming_submissions(confirmation_status, confirmation_sent_at, confirmation_error),
  contact:contacts(id, first_name, last_name, account_owner_id, created_at)
`;

async function fetchAllPages<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>) {
  const all: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const rows = (data ?? []) as T[];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) return all;
  }
}

export function fetchSubmissions(supabase: SupabaseClient): Promise<SubmissionRow[]> {
  return fetchAllPages<SubmissionRow>((from, to) =>
    supabase.from("submissions").select(SUBMISSION_SELECT).order("id").range(from, to),
  );
}

export async function fetchTeamMembers(supabase: SupabaseClient): Promise<(TeamMember & { auth_user_id: string })[]> {
  const { data, error } = await supabase.from("team_members").select("id, display_name, auth_user_id").order("display_name");
  if (error) throw error;
  return data ?? [];
}

/** Eingänge, die noch keine Anfrage geworden sind (Prüfung, Fehler, noch nicht verarbeitet). */
export function fetchOpenIntakes(supabase: SupabaseClient): Promise<IntakeRef[]> {
  return fetchAllPages<IntakeRef>((from, to) =>
    supabase
      .from("incoming_submissions")
      .select("id, status, received_at")
      .neq("status", "processed")
      .order("id")
      .range(from, to),
  );
}

/** Wie oben, mit allen Daten für den Export. */
export type UnresolvedIntake = UnresolvedIntakeInput & { last_error: string | null };

export function fetchUnresolvedIntakes(supabase: SupabaseClient): Promise<UnresolvedIntake[]> {
  return fetchAllPages<UnresolvedIntake>((from, to) =>
    supabase
      .from("incoming_submissions")
      .select(
        "id, status, received_at, payload, normalized_email, normalized_phone, confirmation_status, confirmation_sent_at, confirmation_error, last_error",
      )
      .neq("status", "processed")
      .order("id")
      .range(from, to),
  );
}
