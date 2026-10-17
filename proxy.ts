import { NextResponse, type NextRequest } from "next/server";
import { refreshSession } from "@/lib/supabase/proxy-session";

/** Erste Schutzschicht: /admin nur mit Login, /login nur ohne. Die Datenbank prüft zusätzlich per RLS. */
export async function proxy(request: NextRequest) {
  const { response, isLoggedIn } = await refreshSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
