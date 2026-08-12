"use client";

import React, { useCallback, useState } from "react";
import KycStepper, { type StepDescriptor } from "./KycStepper";
import PersonalDetailsStep from "./PersonalDetailsStep";
import ReviewSummary from "./ReviewSummary";
import { getCountry } from "@/data/kycReference";
import {
  EMPTY_KYC_DETAILS,
  normaliseDetails,
  validateDetails,
} from "@/lib/kycValidation";
import type { KycDetails, KycDetailsField, KycFieldErrors } from "@/types/kyc";

const STEPS: StepDescriptor[] = [
  { id: "details", label: "Your details", description: "Name, document and wallet" },
  { id: "review", label: "Review", description: "Check your answers" },
];

/**
 * Client shell for the KYC submission wizard.
 *
 * Owns the form values and validation state; each step is a presentational
 * component that reports changes back here.
 */
export default function KycForm() {
  const [values, setValues] = useState<KycDetails>(EMPTY_KYC_DETAILS);
  const [errors, setErrors] = useState<KycFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<KycDetailsField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

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
      setStepIndex(1);
    }
  }, [values]);

  const goToDetails = useCallback(() => setStepIndex(0), []);

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
        {stepIndex === 0 ? (
          <PersonalDetailsStep
            values={values}
            errors={errors}
            touched={touched}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmit={handleDetailsSubmit}
            submitAttempted={submitAttempted}
          />
        ) : (
          <div className="space-y-6">
            <ReviewSummary details={values} onEdit={goToDetails} />

            <p className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-xs leading-relaxed text-sky-200/80">
              Photographs of your identity document are attached before this
              application is sent to the compliance team for review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
