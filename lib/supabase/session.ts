import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/supabase/env";

/**
 * Supabase-Client im Namen des eingeloggten Nutzers (Session aus Cookies, Publishable Key).
 * Datenzugriff unterliegt RLS – ohne Login sieht dieser Client keine Anfragen.
 * Pro Request neu erzeugen, nie zwischenspeichern.
 */
export async function getSupabaseSession() {
  const cookieStore = await cookies();

  return createServerClient(requireSupabaseEnv("SUPABASE_URL"), requireSupabaseEnv("SUPABASE_PUBLISHABLE_KEY"), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // In Server Components dürfen keine Cookies gesetzt werden. Die Session-Erneuerung übernimmt proxy.ts.
        }
      },
    },
  });
}
