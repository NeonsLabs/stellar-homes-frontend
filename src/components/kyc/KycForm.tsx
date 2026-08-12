"use client";

import React, { useCallback, useMemo, useState } from "react";
import DocumentsStep from "./DocumentsStep";
import KycStepper, { type StepDescriptor } from "./KycStepper";
import PersonalDetailsStep from "./PersonalDetailsStep";
import ReviewSummary from "./ReviewSummary";
import SubmissionSuccess from "./SubmissionSuccess";
import { getCountry, getDocumentType } from "@/data/kycReference";
import {
  EMPTY_KYC_DETAILS,
  normaliseDetails,
  validateDetails,
} from "@/lib/kycValidation";
import {
  MAX_TOTAL_BYTES,
  formatBytes,
  getDocumentSlots,
  getRequiredSlots,
  submitKycApplication,
  totalUploadBytes,
  validateDocumentFile,
} from "@/lib/kycUpload";
import type {
  DocumentErrors,
  DocumentSlot,
  KycDetails,
  KycDetailsField,
  KycFieldErrors,
  KycSubmissionSuccess,
  UploadedDocument,
} from "@/types/kyc";

const STEPS: StepDescriptor[] = [
  { id: "details", label: "Your details", description: "Name, document and wallet" },
  { id: "documents", label: "Documents", description: "Photos of your ID" },
  { id: "review", label: "Review", description: "Check and submit" },
];

const DETAILS_STEP = 0;
const DOCUMENTS_STEP = 1;
const REVIEW_STEP = 2;

/**
 * Client shell for the KYC submission wizard.
 *
 * Owns the form values, the chosen files and the submission lifecycle; each
 * step is presentational and reports changes back here.
 */
export default function KycForm() {
  const [values, setValues] = useState<KycDetails>(EMPTY_KYC_DETAILS);
  const [errors, setErrors] = useState<KycFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<KycDetailsField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [stepIndex, setStepIndex] = useState(DETAILS_STEP);

  const [documents, setDocuments] = useState<
    Partial<Record<DocumentSlot, UploadedDocument>>
  >({});
  const [documentErrors, setDocumentErrors] = useState<DocumentErrors>({});
  const [totalSizeError, setTotalSizeError] = useState<string | undefined>();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<KycSubmissionSuccess | null>(null);

  const documentType = getDocumentType(values.countryCode, values.documentType);
  const slots = useMemo(() => getDocumentSlots(documentType), [documentType]);

  const handleChange = useCallback((field: KycDetailsField, value: string) => {
    setValues((current) => {
      const next: KycDetails = { ...current, [field]: value };

      if (field === "countryCode") {
        // Document types are country-specific, so a country change invalidates
        // whatever was picked before.
        next.documentType = "";
        next.documentNumber = "";

        // Prefill the dialling code when the user has not typed a number yet.
        const previousDialCode = getCountry(current.countryCode)?.dialCode ?? "";
        const dialCode = getCountry(value)?.dialCode ?? "";
        if (dialCode && (!current.phone || current.phone === previousDialCode)) {
          next.phone = dialCode;
        }
      }

      // Recompute every message so the error summary stays in sync; which of
      // them are actually shown is decided by `touched` in the step itself.
      setErrors(validateDetails(next));
      return next;
    });
  }, []);

  const handleBlur = useCallback((field: KycDetailsField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const handleDetailsSubmit = useCallback(() => {
    const normalised = normaliseDetails(values);
    const nextErrors = validateDetails(normalised);

    setValues(normalised);
    setErrors(nextErrors);
    setSubmitAttempted(true);

    if (Object.keys(nextErrors).length === 0) {
      setStepIndex(DOCUMENTS_STEP);
    }
  }, [values]);

  const handleSelectDocument = useCallback((slot: DocumentSlot, file: File) => {
    const error = validateDocumentFile(file);

    setDocumentErrors((current) => ({ ...current, [slot]: error ?? undefined }));
    if (error) return;

    setDocuments((current) => {
      // Release the previous preview before replacing it, or the blob stays
      // resident for the lifetime of the page.
      const previous = current[slot];
      if (previous) URL.revokeObjectURL(previous.previewUrl);

      return {
        ...current,
        [slot]: { file, previewUrl: URL.createObjectURL(file) },
      };
    });
    setTotalSizeError(undefined);
  }, []);

  const handleRemoveDocument = useCallback((slot: DocumentSlot) => {
    setDocuments((current) => {
      const previous = current[slot];
      if (previous) URL.revokeObjectURL(previous.previewUrl);

      const next = { ...current };
      delete next[slot];
      return next;
    });
    setDocumentErrors((current) => ({ ...current, [slot]: undefined }));
    setTotalSizeError(undefined);
  }, []);

  const handleDocumentsContinue = useCallback(() => {
    const required = getRequiredSlots(documentType);
    const nextErrors: DocumentErrors = {};

    required.forEach((slot) => {
      if (!documents[slot]) nextErrors[slot] = "This image is required.";
    });

    const files = Object.fromEntries(
      Object.entries(documents).map(([slot, document]) => [slot, document.file]),
    ) as Partial<Record<DocumentSlot, File>>;

    const bytes = totalUploadBytes(files);
    const sizeError =
      bytes > MAX_TOTAL_BYTES
        ? `Your uploads total ${formatBytes(bytes)} — the limit is ${formatBytes(MAX_TOTAL_BYTES)}. Replace an image with a smaller one.`
        : undefined;

    setDocumentErrors(nextErrors);
    setTotalSizeError(sizeError);

    if (Object.keys(nextErrors).length === 0 && !sizeError) {
      setStepIndex(REVIEW_STEP);
    }
  }, [documentType, documents]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);

    const files = Object.fromEntries(
      Object.entries(documents).map(([slot, document]) => [slot, document.file]),
    ) as Partial<Record<DocumentSlot, File>>;

    const response = await submitKycApplication(values, files);

    if (response.ok) {
      setResult(response);
      setSubmitting(false);
      return;
    }

    // Send the user back to whichever step owns the rejected input.
    if (response.fieldErrors && Object.keys(response.fieldErrors).length > 0) {
      setErrors(response.fieldErrors);
      setSubmitAttempted(true);
      setStepIndex(DETAILS_STEP);
    } else if (
      response.documentErrors &&
      Object.keys(response.documentErrors).length > 0
    ) {
      setDocumentErrors(response.documentErrors);
      setStepIndex(DOCUMENTS_STEP);
    }

    setSubmitError(response.message);
    setSubmitting(false);
  }, [documents, values]);

  if (result) {
    return (
      <div className="glass-panel glass-card-glow rounded-3xl p-6 md:p-8">
        <SubmissionSuccess result={result} email={values.email} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel rounded-3xl p-6">
        <KycStepper
          steps={STEPS}
          currentIndex={stepIndex}
          onNavigate={(index) => setStepIndex(index)}
        />
      </div>

      <div className="glass-panel glass-card-glow rounded-3xl p-6 md:p-8">
        {stepIndex === DETAILS_STEP && (
          <PersonalDetailsStep
            values={values}
            errors={errors}
            touched={touched}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmit={handleDetailsSubmit}
            submitAttempted={submitAttempted}
          />
        )}

        {stepIndex === DOCUMENTS_STEP && (
          <DocumentsStep
            documentType={documentType}
            slots={slots}
            documents={documents}
            errors={documentErrors}
            totalSizeError={totalSizeError}
            onSelect={handleSelectDocument}
            onRemove={handleRemoveDocument}
            onBack={() => setStepIndex(DETAILS_STEP)}
            onContinue={handleDocumentsContinue}
          />
        )}

        {stepIndex === REVIEW_STEP && (
          <div className="space-y-8">
            <ReviewSummary
              details={values}
              slots={slots}
              documents={documents}
              onEdit={() => setStepIndex(DETAILS_STEP)}
              onEditDocuments={() => setStepIndex(DOCUMENTS_STEP)}
            />

            {submitError && (
              <p
                role="alert"
                className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
              >
                {submitError}
              </p>
            )}

            <p className="text-xs leading-relaxed text-slate-500">
              By submitting you confirm the information above is accurate and that
              the documents are photographs of your own original identity document.
            </p>

            <div className="flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setStepIndex(DOCUMENTS_STEP)}
                disabled={submitting}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                    <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0110 10h-3a7 7 0 00-7-7V2z" />
                  </svg>
                )}
                {submitting ? "Submitting…" : "Submit for verification"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
