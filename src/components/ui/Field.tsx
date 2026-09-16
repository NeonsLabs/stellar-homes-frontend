"use client";

import React, { useId } from "react";
import { parseUsdc, toUsdcString } from "@/lib/format";

export interface FieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: (id: string) => React.ReactNode;
}

/** Label, control and hint, wired together for assistive tech. */
export default function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold tracking-wide text-slate-400 uppercase">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs text-rose-300">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`glass-input ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`glass-input ${props.className ?? ""}`} />;
}

export interface AmountFieldProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  hint?: React.ReactNode;
  /** Upper bound in base units, shown as a "max" shortcut. */
  max?: bigint;
  maxLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}

/** A USDC amount typed as decimal text; validated against 7 decimals. */
export function AmountField({ label, value, onChange, hint, max, maxLabel = "Max", placeholder, disabled }: AmountFieldProps) {
  const parsed = value ? parseUsdc(value) : null;
  const error = value && parsed === null ? "Enter an amount in USDC, up to 7 decimal places." : undefined;
  return (
    <Field label={label} hint={hint} error={error}>
      {(id) => (
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-slate-500">$</span>
          <TextInput
            id={id}
            inputMode="decimal"
            autoComplete="off"
            value={value}
            placeholder={placeholder ?? "0.00"}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="pr-24 pl-8 font-mono"
          />
          <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
            {max !== undefined && max > 0n && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(toUsdcString(max))}
                className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[11px] font-bold text-sky-300 hover:bg-sky-500/20"
              >
                {maxLabel}
              </button>
            )}
            <span className="text-xs font-semibold text-slate-500">USDC</span>
          </span>
        </div>
      )}
    </Field>
  );
}
