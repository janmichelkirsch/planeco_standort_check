"use client";

import { useEffect, useState } from "react";
import { searchAddresses, type AddressSuggestion } from "@/lib/photon";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

type Props = {
  onSelect: (suggestion: AddressSuggestion) => void;
  onManual: () => void;
};

/** Suchfeld mit Adressvorschlägen. Fällt Photon aus, bleibt immer die manuelle Eingabe. */
export function AddressSearch({ onSelect, onManual }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  // Label des gewählten Vorschlags: Dafür soll keine neue Suche starten.
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH || query === selectedLabel) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        setSuggestions(await searchAddresses(trimmed, controller.signal));
        setStatus("idle");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("[AddressSearch] Photon-Abfrage fehlgeschlagen", error);
        setSuggestions([]);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedLabel]);

  const showSuggestions = query.trim().length >= MIN_QUERY_LENGTH && query !== selectedLabel;

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Adresse des Grundstücks suchen</span>
        <input
          type="text"
          inputMode="search"
          autoComplete="off"
          placeholder="z. B. Osterstraße 88, Hamburg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded border border-zinc-400 px-3 py-3 text-base"
        />
      </label>

      {showSuggestions && status === "loading" && <p className="text-sm text-zinc-500">Suche …</p>}
      {showSuggestions && status === "error" && (
        <p className="text-sm text-red-600">Adresssuche gerade nicht verfügbar – bitte manuell eingeben.</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="flex flex-col rounded border border-zinc-300">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(s);
                  setSelectedLabel(s.label);
                  setQuery(s.label);
                  setSuggestions([]);
                }}
                className="w-full border-b border-zinc-200 px-3 py-3 text-left text-base last:border-b-0"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={onManual} className="self-start text-sm underline">
        Adresse nicht gefunden? Manuell eingeben
      </button>
    </div>
  );
}
