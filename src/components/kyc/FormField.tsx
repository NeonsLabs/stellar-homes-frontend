"use client";

import React from "react";

const CONTROL_BASE =
  "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white transition-colors placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

const CONTROL_VALID =
  "border-white/10 focus-visible:border-sky-500/50 focus-visible:ring-sky-400/40";

const CONTROL_INVALID =
  "border-rose-500/50 bg-rose-500/[0.06] focus-visible:border-rose-500 focus-visible:ring-rose-400/40";

interface FieldShellProps {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
}

/**
 * Label / control / hint / error layout with the ARIA wiring done once.
 *
 * The control is supplied by the caller so the same accessible shell serves
 * inputs, selects and anything added later.
 */
function FieldShell({
  name,
  label,
  hint,
  error,
  required = false,
  children,
}: FieldShellProps) {
  const id = `kyc-${name}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-200">
        {label}
        {required && (
          <span className="ml-1 text-rose-400" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children({ id, describedBy, invalid: Boolean(error) })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-xs text-rose-400">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export interface TextFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: "text" | "email" | "tel" | "date";
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  /** Renders the value in a monospace face, for keys and document numbers. */
  mono?: boolean;
  maxLength?: number;
}

export function TextField({
  name,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  hint,
  error,
  required = false,
  disabled = false,
  autoComplete,
  inputMode,
  mono = false,
  maxLength,
}: TextFieldProps) {
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${CONTROL_BASE} ${invalid ? CONTROL_INVALID : CONTROL_VALID} ${mono ? "font-mono" : ""}`}
        />
      )}
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SelectField({
  name,
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  hint,
  error,
  required = false,
  disabled = false,
}: SelectFieldProps) {
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            id={id}
            name={name}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={`${CONTROL_BASE} ${invalid ? CONTROL_INVALID : CONTROL_VALID} appearance-none pr-10`}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#161f30]">
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </FieldShell>
  );
}
