"use client";

import { MobileForm } from "@/components/MobileForm";
import { useLeadForm } from "@/lib/use-lead-form";

/** Einstieg des Formulars. Hält den gemeinsamen Zustand, damit ein Wechsel der Variante nichts verliert. */
export function StandortForm() {
  const form = useLeadForm();
  return <MobileForm form={form} />;
}
