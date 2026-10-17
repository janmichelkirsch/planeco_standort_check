import "server-only";

type SupabaseEnvKey = "SUPABASE_URL" | "SUPABASE_SECRET_KEY" | "SUPABASE_PUBLISHABLE_KEY";

/** Liest eine Supabase-Umgebungsvariable und bricht mit klarer Meldung ab, wenn sie fehlt. */
export function requireSupabaseEnv(key: SupabaseEnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Umgebungsvariable ${key} ist nicht gesetzt`);
  }
  return value;
}
