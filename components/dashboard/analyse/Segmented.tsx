"use client";

/** Umschalter mit gleichwertigen Optionen (Zeitraum, Gruppierung, Darstellung). */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  size = "md",
}: {
  label: string;
  value: T | undefined;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  size?: "md" | "sm";
}) {
  return (
    <div role="group" aria-label={label} className={`inline-flex gap-0.5 rounded-xl bg-sage-deep p-1 ${size === "sm" ? "h-9" : "h-11"}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={o.id === value}
          onClick={() => onChange(o.id)}
          className={`rounded-lg px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forest ${
            o.id === value ? "bg-white text-forest shadow-card" : "text-forest-soft hover:text-forest"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
