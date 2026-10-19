"use client";

import { useLayoutEffect, useMemo, useRef, type InputHTMLAttributes } from "react";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import { FieldError, Label, inputBase, inputBorder } from "@/components/Field";
import { applyPhoneEdit, buildPhoneCountryOptions, changePhoneCountry, flagEmoji, isInternational, type PhoneEdit } from "@/lib/phone-input";

type PhoneFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id"> & {
  value: string;
  country: CountryCode;
  onChange: (next: { value: string; country: CountryCode }) => void;
  error?: string;
  hint?: string;
};

/**
 * Telefon mit Vorwahl-Dropdown: links Flagge + Vorwahl (native Auswahl, auf dem Handy die System-Liste),
 * rechts die Nummer ohne Vorwahl, beim Tippen formatiert. Logik in `lib/phone-input.ts`.
 */
export function PhoneField({ value, country, onChange, error, hint, disabled, className = "", ...props }: PhoneFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const options = useMemo(() => buildPhoneCountryOptions(), []);
  const describedBy = [error && "phone-error", hint && "phone-hint"].filter(Boolean).join(" ") || undefined;

  // Nach dem Formatieren den Cursor hinter dieselbe Ziffer setzen (sonst springt er ans Ende).
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && pendingCaret.current !== null && document.activeElement === input) {
      input.setSelectionRange(pendingCaret.current, pendingCaret.current);
    }
    pendingCaret.current = null;
  }, [value]);

  const emit = (edit: PhoneEdit) => {
    pendingCaret.current = edit.caret;
    onChange({ value: edit.value, country: edit.country });
  };

  return (
    <div className={className}>
      <Label htmlFor="phone">Telefon</Label>
      <div className="flex gap-2">
        <div
          className={`relative flex shrink-0 items-center rounded-xl border bg-white px-3 text-base text-forest transition-[border-color,box-shadow] focus-within:border-forest focus-within:ring-4 focus-within:ring-forest/12 ${
            disabled ? "border-line bg-sage text-forest-muted" : "border-line hover:border-forest-soft"
          }`}
        >
          <span aria-hidden="true" className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-lg leading-none">{flagEmoji(country)}</span>
            <span>+{getCountryCallingCode(country)}</span>
            <svg viewBox="0 0 12 12" className="size-3 text-forest-muted" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <select
            id="phoneCountry"
            name="phoneCountry"
            aria-label="Ländervorwahl"
            autoComplete="tel-country-code"
            value={country}
            disabled={disabled}
            onChange={(e) => emit(changePhoneCountry(value, e.target.value as CountryCode))}
            className="absolute inset-0 cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
          >
            {options.pinned.map((o) => (
              <option key={o.code} value={o.code}>
                {`${o.flag} ${o.name} (${o.callingCode})`}
              </option>
            ))}
            <option disabled>──────────</option>
            {options.others.map((o) => (
              <option key={o.code} value={o.code}>
                {`${o.flag} ${o.name} (${o.callingCode})`}
              </option>
            ))}
          </select>
        </div>
        <input
          ref={inputRef}
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required
          value={value}
          disabled={disabled}
          onChange={(e) => emit(applyPhoneEdit(value, e.target.value, e.target.selectionStart, country))}
          onPaste={(e) => {
            // Eine eingefügte Nummer mit Ländervorwahl ist vollständig: ersetzt den Inhalt statt mitten hinein.
            const pasted = e.clipboardData.getData("text");
            if (isInternational(pasted)) {
              e.preventDefault();
              emit(applyPhoneEdit("", pasted, pasted.length, country));
            }
          }}
          className={`${inputBase} ${inputBorder(error)} min-w-0 flex-1`}
          {...props}
        />
      </div>
      {hint && !error && (
        <p id="phone-hint" className="mt-2 text-[13px] text-forest-soft">
          {hint}
        </p>
      )}
      <FieldError id="phone-error" message={error} />
    </div>
  );
}
