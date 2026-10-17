"use server";

import { redirect } from "next/navigation";
import { getSupabaseSession } from "@/lib/supabase/session";

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Bitte E-Mail und Passwort eingeben." };
  }

  const supabase = await getSupabaseSession();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Bewusst unspezifisch: nicht verraten, ob die E-Mail existiert.
    console.error("[login] Anmeldung fehlgeschlagen", error.message);
    return { error: "E-Mail oder Passwort falsch." };
  }

  redirect("/admin");
}
