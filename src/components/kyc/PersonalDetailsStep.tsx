"use client";

import React, { useRef } from "react";
import { SelectField, TextField } from "./FormField";
import { SUPPORTED_COUNTRIES, getCountry, getDocumentType } from "@/data/kycReference";
import { FIELD_LABELS } from "@/lib/kycValidation";
import type { KycDetails, KycDetailsField, KycFieldErrors } from "@/types/kyc";

/** Order the error summary and focus management follow. */
const FIELD_ORDER: KycDetailsField[] = [
  "fullName",
  "dateOfBirth",
  "email",
  "phone",
  "countryCode",
  "documentType",
  "documentNumber",
  "walletAddress",
];

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-bold tracking-wide text-white uppercase">{title}</h3>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

export interface PersonalDetailsStepProps {
  values: KycDetails;
  errors: KycFieldErrors;
  /** Fields the user has interacted with; errors only show once touched. */
  touched: Partial<Record<KycDetailsField, boolean>>;
  onChange: (field: KycDetailsField, value: string) => void;
  onBlur: (field: KycDetailsField) => void;
  onSubmit: () => void;
  /** True once the user has tried to continue, which reveals every error. */
  submitAttempted: boolean;
}

/**
 * The identity details captured before any document is uploaded.
 *
 * Errors surface on blur and, once the user has tried to continue, in a
 * summary at the top of the form that links straight to each offending field.
 */
export default function PersonalDetailsStep({
  values,
  errors,
  touched,
  onChange,
  onBlur,
  onSubmit,
  submitAttempted,
}: PersonalDetailsStepProps) {
  const summaryRef = useRef<HTMLDivElement>(null);

  const country = getCountry(values.countryCode);
  const documentType = getDocumentType(values.countryCode, values.documentType);

  /** An error is only shown once the field has been touched or submit tried. */
  const errorFor = (field: KycDetailsField): string | undefined =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const visibleErrors = FIELD_ORDER.filter((field) => errorFor(field));
  const showSummary = submitAttempted && visibleErrors.length > 0;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit();
    // Let the summary render before moving focus to it.
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {showSummary && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 outline-none"
        >
          <p className="text-sm font-semibold text-rose-300">
            {visibleErrors.length === 1
              ? "One field needs your attention"
              : `${visibleErrors.length} fields need your attention`}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-rose-200/80">
            {visibleErrors.map((field) => (
              <li key={field}>
                <a href={`#kyc-${field}`} className="underline underline-offset-2 hover:text-white">
                  {FIELD_LABELS[field]}
                </a>
                {" — "}
                {errors[field]}
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="space-y-5">
        <legend className="sr-only">Personal details</legend>
        <SectionHeading
          title="Personal details"
          description="Enter your details exactly as they appear on your identity document."
        />

        <TextField
          name="fullName"
          label={FIELD_LABELS.fullName}
          value={values.fullName}
          onChange={(value) => onChange("fullName", value)}
          onBlur={() => onBlur("fullName")}
          error={errorFor("fullName")}
          placeholder="Adaeze Chioma Okonkwo"
          autoComplete="name"
          hint="Include every given name printed on the document."
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="dateOfBirth"
            label={FIELD_LABELS.dateOfBirth}
            type="date"
            value={values.dateOfBirth}
            onChange={(value) => onChange("dateOfBirth", value)}
            onBlur={() => onBlur("dateOfBirth")}
            error={errorFor("dateOfBirth")}
            autoComplete="bday"
            hint="You must be 18 or older to borrow."
            required
          />

          <TextField
            name="email"
            label={FIELD_LABELS.email}
            type="email"
            value={values.email}
            onChange={(value) => onChange("email", value)}
            onBlur={() => onBlur("email")}
            error={errorFor("email")}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            hint="Verification updates are sent here."
            required
          />
        </div>

        <TextField
          name="phone"
          label={FIELD_LABELS.phone}
          type="tel"
          value={values.phone}
          onChange={(value) => onChange("phone", value)}
          onBlur={() => onBlur("phone")}
          error={errorFor("phone")}
          placeholder="+234 801 234 5678"
          autoComplete="tel"
          inputMode="tel"
          hint="Include the international dialling code."
          required
        />
      </fieldset>

      <fieldset className="space-y-5 border-t border-white/5 pt-8">
        <legend className="sr-only">Identity document</legend>
        <SectionHeading
          title="Identity document"
          description="Choose the document you will photograph in the next step."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            name="countryCode"
            label={FIELD_LABELS.countryCode}
            value={values.countryCode}
            onChange={(value) => onChange("countryCode", value)}
            onBlur={() => onBlur("countryCode")}
            error={errorFor("countryCode")}
            placeholder="Select a country"
            options={SUPPORTED_COUNTRIES.map((entry) => ({
              value: entry.code,
              label: entry.name,
            }))}
            required
          />

          <SelectField
            name="documentType"
            label={FIELD_LABELS.documentType}
            value={values.documentType}
            onChange={(value) => onChange("documentType", value)}
            onBlur={() => onBlur("documentType")}
            error={errorFor("documentType")}
            placeholder={country ? "Select a document" : "Select a country first"}
            disabled={!country}
            options={(country?.documentTypes ?? []).map((entry) => ({
              value: entry.id,
              label: entry.label,
            }))}
            required
          />
        </div>

        <TextField
          name="documentNumber"
          label={FIELD_LABELS.documentNumber}
          value={values.documentNumber}
          onChange={(value) => onChange("documentNumber", value)}
          onBlur={() => onBlur("documentNumber")}
          error={errorFor("documentNumber")}
          placeholder={documentType?.placeholder ?? "Select a document type first"}
          disabled={!documentType}
          hint={documentType?.hint}
          mono
          required
        />
      </fieldset>

      <fieldset className="space-y-5 border-t border-white/5 pt-8">
        <legend className="sr-only">Stellar wallet</legend>
        <SectionHeading
          title="Stellar wallet"
          description="PROP tokens are issued with AUTH_REQUIRED, so this account is authorised once you pass verification."
        />

        <TextField
          name="walletAddress"
          label={FIELD_LABELS.walletAddress}
          value={values.walletAddress}
          onChange={(value) => onChange("walletAddress", value)}
          onBlur={() => onBlur("walletAddress")}
          error={errorFor("walletAddress")}
          placeholder="GB7R7U3AN4V6TPAZ7X3O5FHEPA4X3KJH24B5XWEXM6X3OZQ7LKMD2FA"
          hint="Your public key — never share your secret key with anyone."
          mono
          maxLength={56}
          required
        />
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:justify-end">
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
