import type { InputHTMLAttributes, ReactNode } from "react";
import { Alert } from "@/components/icons";

// 16px Schrift (text-base) verhindert, dass iOS Safari beim Fokus in das Feld zoomt.
export const inputBase =
  "block h-[52px] w-full rounded-xl border bg-white px-4 text-base text-forest placeholder:text-forest-muted transition-[border-color,box-shadow] outline-none focus:border-forest focus:ring-4 focus:ring-forest/12 disabled:cursor-not-allowed disabled:bg-sage disabled:text-forest-muted";

export function inputBorder(error?: string) {
  return error ? "border-danger focus:border-danger focus:ring-danger/12" : "border-line hover:border-forest-soft";
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[13px] leading-5 text-danger">
      <Alert className="mt-px size-4 shrink-0" />
      {message}
    </p>
  );
}

export function Label({ htmlFor, children, optional }: { htmlFor: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline gap-1.5 text-sm font-medium text-forest">
      {children}
      {optional ? (
        <span className="text-xs font-normal text-forest-muted">(optional)</span>
      ) : (
        <span aria-hidden="true" className="text-coral-dark">
          *
        </span>
      )}
    </label>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
};

/** Eingabefeld mit Label, optionalem Hinweis und Fehlermeldung (barrierefrei verknüpft). */
export function Field({ id, label, error, optional, hint, className = "", ...props }: FieldProps) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={optional ? undefined : true}
        className={`${inputBase} ${inputBorder(error)}`}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-[13px] text-forest-soft">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
