"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "@/components/icons";

/**
 * Schwebendes Feld an einem Auslöser (aus dem Figma-Entwurf). Liegt in einem Portal, damit die Liste es nicht abschneidet;
 * schließt bei Klick daneben, Escape, Scrollen und Größenänderung.
 */
export function Popover({
  anchor,
  onClose,
  label,
  role = "dialog",
  className = "",
  children,
}: {
  anchor: HTMLElement;
  onClose: (refocus: boolean) => void;
  label: string;
  role?: "dialog" | "menu";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect();
    const width = ref.current?.offsetWidth ?? 0;
    const height = ref.current?.offsetHeight ?? 0;
    // Unten kein Platz (letzte Zeilen der Liste) → über dem Auslöser öffnen.
    const below = r.bottom + 6;
    const top = below + height > window.innerHeight - 12 && r.top - height - 6 > 12 ? r.top - height - 6 : below;
    setPos({ top, left: Math.max(12, Math.min(r.left, window.innerWidth - width - 12)) });
  }, [anchor]);

  // Cache Components halten verlassene Seiten versteckt am Leben (<Activity>); ein offenes Menü soll dabei zugehen.
  // Verzögert, weil StrictMode Effekte im Dev-Modus sofort ab- und wieder aufbaut – das darf das Menü nicht schließen.
  const hideTimer = useRef<number | undefined>(undefined);
  useLayoutEffect(() => {
    window.clearTimeout(hideTimer.current);
    return () => {
      hideTimer.current = window.setTimeout(() => onClose(false), 0);
    };
  }, [onClose]);

  useEffect(() => {
    const down = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !anchor.contains(t)) onClose(false);
    };
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose(true);
    };
    const away = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose(false);
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", away, true);
    window.addEventListener("resize", away);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", away, true);
      window.removeEventListener("resize", away);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={ref}
      role={role}
      aria-label={label}
      // Die Position wird zur Laufzeit gemessen, daher inline.
      style={{ position: "fixed", top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
      className={`z-50 rounded-xl bg-white p-1.5 text-forest shadow-card ring-1 ring-line-soft ${className}`}
    >
      {children}
    </div>,
    document.body,
  );
}

export type MenuAction = { label: ReactNode; icon?: ReactNode; tone?: "accent" | "danger"; onSelect: () => void };

export type MenuEntry =
  | ({ kind: "action" } & MenuAction)
  | { kind: "sub"; label: ReactNode; icon?: ReactNode; items: MenuAction[] }
  | { kind: "heading"; label: ReactNode }
  | { kind: "separator" };

const itemCls =
  "flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm whitespace-nowrap outline-none hover:bg-sage focus-visible:bg-sage";
const toneCls = { accent: "font-semibold text-coral-ink", danger: "text-danger" };

function focusItems(root: HTMLElement | null) {
  return [...(root?.querySelectorAll<HTMLElement>(":scope > [data-mi], :scope > div > [data-mi]") ?? [])];
}

/** Menü mit Pfeiltasten, Home/End, Untermenüs (→/←) und Escape. Auswahl schließt das Menü. */
export function Menu({
  anchor,
  label,
  entries,
  onClose,
}: {
  anchor: HTMLElement;
  label: string;
  entries: MenuEntry[];
  onClose: (refocus: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const [sub, setSub] = useState<number | null>(null);
  const [subFocus, setSubFocus] = useState(false);

  useEffect(() => {
    focusItems(rootRef.current)[0]?.focus();
  }, []);
  useEffect(() => {
    if (sub !== null && subFocus) focusItems(subRef.current)[0]?.focus();
  }, [sub, subFocus]);

  const move = (e: KeyboardEvent, root: HTMLElement | null) => {
    const list = focusItems(root);
    const i = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") list[(i + 1) % list.length]?.focus();
    else if (e.key === "ArrowUp") list[(i - 1 + list.length) % list.length]?.focus();
    else if (e.key === "Home") list[0]?.focus();
    else if (e.key === "End") list[list.length - 1]?.focus();
    else if (e.key === "Tab") onClose(false);
    else return;
    e.preventDefault();
  };

  const select = (a: MenuAction) => {
    onClose(false);
    a.onSelect();
  };

  return (
    <Popover anchor={anchor} onClose={onClose} label={label} role="menu" className="min-w-56">
      <div ref={rootRef} onKeyDown={(e) => sub === null && move(e, rootRef.current)}>
        {entries.map((e, i) => {
          if (e.kind === "separator") return <div key={i} role="separator" className="my-1.5 h-px bg-line-soft" />;
          if (e.kind === "heading")
            return (
              <p key={i} className="px-2.5 pt-1.5 pb-1 text-xs text-forest-soft">
                {e.label}
              </p>
            );
          if (e.kind === "action")
            return (
              <button
                key={i}
                data-mi
                role="menuitem"
                type="button"
                onMouseEnter={() => setSub(null)}
                onClick={() => select(e)}
                className={`${itemCls} ${e.tone ? toneCls[e.tone] : ""}`}
              >
                {e.icon}
                {e.label}
              </button>
            );
          const open = sub === i;
          return (
            <div key={i} className="relative">
              <button
                data-mi
                role="menuitem"
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onMouseEnter={() => {
                  setSubFocus(false);
                  setSub(i);
                }}
                onClick={() => {
                  setSubFocus(true);
                  setSub(i);
                }}
                onKeyDown={(ev) => {
                  if (ev.key === "ArrowRight" || ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    ev.stopPropagation();
                    setSubFocus(true);
                    setSub(i);
                  }
                }}
                className={`${itemCls} ${open ? "bg-sage" : ""}`}
              >
                {e.icon}
                <span className="flex-1">{e.label}</span>
                <ChevronRight className="size-4 text-forest-soft" />
              </button>
              {open && (
                <div
                  ref={subRef}
                  role="menu"
                  aria-label={typeof e.label === "string" ? e.label : undefined}
                  onKeyDown={(ev) => {
                    ev.stopPropagation();
                    if (ev.key === "ArrowLeft" || ev.key === "Escape") {
                      ev.preventDefault();
                      setSub(null);
                      setSubFocus(false);
                      (ev.currentTarget.previousElementSibling as HTMLElement | null)?.focus();
                    } else move(ev, subRef.current);
                  }}
                  className="absolute top-0 left-full ml-1.5 min-w-44 rounded-xl bg-white p-1.5 shadow-card ring-1 ring-line-soft"
                >
                  {e.items.map((a, j) => (
                    <button
                      key={j}
                      data-mi
                      role="menuitem"
                      type="button"
                      onClick={() => select(a)}
                      className={`${itemCls} ${a.tone ? toneCls[a.tone] : ""}`}
                    >
                      {a.icon}
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Popover>
  );
}

/** Zustand für ein Menü/Popover an einem Knopf: öffnen, schließen, Fokus zurück. */
export function useAnchor() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = useCallback((refocus: boolean) => {
    setAnchor((a) => {
      if (refocus) a?.focus();
      return null;
    });
  }, []);
  const toggle = (el: HTMLElement) => setAnchor((a) => (a === el ? null : el));
  return { anchor, toggle, close };
}
