import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/supabase/env";

/**
 * Erneuert die Login-Session im Proxy und meldet, ob jemand eingeloggt ist.
 * Die Cookies müssen auf genau die zurückgegebene Response gesetzt werden.
 */
export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    requireSupabaseEnv("SUPABASE_URL"),
    requireSupabaseEnv("SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, headers) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // getClaims prüft die Signatur des Tokens – getSession allein wäre nicht vertrauenswürdig.
  const { data } = await supabase.auth.getClaims();
  return { response, isLoggedIn: Boolean(data?.claims) };
}
