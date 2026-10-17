"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { FieldError, Label, inputBase, inputBorder } from "@/components/Field";
import { Alert, Pin, Search, Spinner } from "@/components/icons";
import { searchAddresses, type AddressSuggestion } from "@/lib/photon";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

type Status = "idle" | "loading" | "results" | "empty" | "error";

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  onManual: () => void;
  error?: string;
  disabled?: boolean;
  /** Vorschläge im Seitenfluss statt als Dropdown (Mobile: nicht hinter der Tastatur versteckt). */
  inline?: boolean;
};

/**
 * Suchfeld mit Adressvorschlägen von Photon (Combobox mit Tastatursteuerung).
 * Fällt Photon aus oder findet nichts, führt der Weg immer zur manuellen Eingabe.
 */
export function AddressSearch({ query, onQueryChange, onSelect, onManual, error, disabled, inline }: Props) {
  const id = "address";
  const listId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const trimmed = query.trim();
  const searchable = trimmed.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!searchable) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const found = await searchAddresses(trimmed, controller.signal);
        setResults(found);
        setActive(found.length ? 0 : -1);
        setStatus(found.length ? "results" : "empty");
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("[AddressSearch] Photon-Abfrage fehlgeschlagen", err);
        setResults([]);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, searchable]);

  const visibleStatus: Status = searchable ? status : "idle";
  const showPanel = open && visibleStatus !== "idle";

  const choose = (s: AddressSuggestion) => {
    setOpen(false);
    onSelect(s);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") return setOpen(false);
    if (visibleStatus !== "results") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && open && active >= 0) {
      e.preventDefault();
      choose(results[active]);
    }
  };

  return (
    <div>
      <Label htmlFor={id}>Adresse des Grundstücks suchen</Label>
      <div className="relative">
        {/* Eigener Positionsrahmen fürs Eingabefeld: Icons bleiben mittig, auch wenn darunter die Liste aufgeht. */}
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-forest-soft" />
          <input
            id={id}
            type="text"
            role="combobox"
            autoComplete="off"
            disabled={disabled}
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showPanel && visibleStatus === "results" && active >= 0 ? `${listId}-${active}` : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-required
            placeholder="z. B. Osterstraße 88, Hamburg"
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setOpen(true);
            }}
            onFocus={(e) => {
              setOpen(true);
              // Feld nach oben holen, damit die Vorschläge über der Tastatur sichtbar bleiben.
              if (inline) setTimeout(() => e.target.scrollIntoView({ block: "start", behavior: "smooth" }), 250);
            }}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKeyDown}
            enterKeyHint="search"
            className={`${inputBase} ${inputBorder(error)} scroll-mt-4 pr-11 pl-12 ${inline ? "h-14 rounded-2xl" : ""}`}
          />
          {visibleStatus === "loading" && (
            <Spinner className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-forest-soft" />
          )}
        </div>

        {showPanel && (
          <div
            className={
              inline
                ? "relative mt-2 overflow-hidden rounded-2xl border border-line-soft bg-white"
                : "absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-line-soft bg-white shadow-[0_18px_40px_-16px_rgba(34,64,59,0.28)]"
            }
          >
            {visibleStatus === "loading" && (
              <p className="flex items-center gap-2 px-4 py-4 text-sm text-forest-soft" role="status">
                <Spinner className="size-4" /> Adressen werden gesucht …
              </p>
            )}
            {visibleStatus === "results" && (
              <ul id={listId} role="listbox" aria-label="Adressvorschläge" className="py-1.5">
                {results.map((s, i) => (
                  <li
                    key={s.id}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(s)}
                    className={`mx-1.5 flex cursor-pointer items-center gap-3 rounded-lg px-3 ${inline ? "min-h-14 py-3" : "py-2.5"} ${
                      i === active ? "bg-sage" : ""
                    }`}
                  >
                    <Pin className="size-5 shrink-0 text-forest-soft" />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium">
                        {[s.street, s.houseNumber].filter(Boolean).join(" ")}
                      </span>
                      <span className="block truncate text-[13px] text-forest-soft">
                        {[s.postalCode, s.city].filter(Boolean).join(" ")}
                        {s.district ? ` · ${s.district}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {(visibleStatus === "empty" || visibleStatus === "error") && (
              <div className="px-4 py-4" role="status">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Alert className="size-4 text-forest-soft" />
                  {visibleStatus === "empty" ? "Keine passende Adresse gefunden." : "Die Adresssuche ist gerade nicht erreichbar."}
                </p>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onManual}
                  className="mt-2 ml-6 text-sm font-medium text-coral-dark underline underline-offset-4 hover:text-forest"
                >
                  Adresse manuell eingeben
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <FieldError id={`${id}-error`} message={error} />
      <button
        type="button"
        onClick={onManual}
        disabled={disabled}
        className={`text-forest-soft underline underline-offset-4 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
          inline ? "mt-2 min-h-11 text-sm" : "mt-3 text-[13px]"
        }`}
      >
        Adresse nicht gefunden? <span className="font-medium text-forest">Manuell eingeben</span>
      </button>
    </div>
  );
}
