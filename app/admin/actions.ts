"use server";

import { redirect } from "next/navigation";
import { getSupabaseSession } from "@/lib/supabase/session";

export async function logout() {
  const supabase = await getSupabaseSession();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[logout] Abmelden fehlgeschlagen", error.message);
  }
  redirect("/login");
}
