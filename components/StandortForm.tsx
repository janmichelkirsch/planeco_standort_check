"use client";

import { useSyncExternalStore } from "react";
import { DesktopForm } from "@/components/DesktopForm";
import { MobileForm } from "@/components/MobileForm";
import { useLeadForm } from "@/lib/use-lead-form";

// Ab hier die Desktop-Variante (gleiche Grenze wie im Figma-Entwurf).
const DESKTOP_QUERY = "(min-width: 640px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;
// Auf dem Server ist die Bildschirmbreite unbekannt.
const unknownOnServer = () => null;

/**
 * Einstieg des Formulars. Hält den gemeinsamen Zustand, damit ein Wechsel der Variante
 * (Fenster verkleinern, Handy drehen) keine Eingaben verliert.
 */
export function StandortForm() {
  const form = useLeadForm();
  const desktop = useSyncExternalStore(subscribe, isDesktop, unknownOnServer);

  // Bis die Breite im Browser feststeht, nur die Hintergrundfläche – verhindert ein Springen zwischen den Varianten.
  if (desktop === null) return <div className="min-h-dvh bg-sage" aria-busy="true" />;
  return desktop ? <DesktopForm form={form} /> : <MobileForm form={form} />;
}
