"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { FeedbackLine, type Feedback } from "@/components/dashboard/ui";
import { DASHBOARD_RESULTS, type DashboardResult } from "@/lib/dashboard-forms";

type Show = (feedback: Feedback | null) => void;
const FeedbackContext = createContext<Show>(() => {});

/** Meldung oben im Dashboard nach einer Aktion (Übernehmen, Speichern, Erneut verarbeiten). Schließbar, ersetzt die vorige. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  return (
    <FeedbackContext.Provider value={setFeedback}>
      {feedback && (
        <div className="mb-6">
          <FeedbackLine feedback={feedback} onDismiss={() => setFeedback(null)} />
        </div>
      )}
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const show = useContext(FeedbackContext);
  return {
    show,
    /** Standardtext zu einem Ergebnis; `text` ersetzt ihn (z. B. mit Namen). */
    showResult: (result: DashboardResult, text?: string) => show({ tone: DASHBOARD_RESULTS[result].tone, text: text ?? DASHBOARD_RESULTS[result].text }),
    /** Für Aufrufe, die gar nicht beim Server ankommen (Netz weg, Server-Fehler). */
    showFailure: (error: unknown, where: string, text: string = DASHBOARD_RESULTS.error.text) => {
      console.error(`[admin] ${where} fehlgeschlagen`, error);
      show({ tone: "error", text });
    },
  };
}
