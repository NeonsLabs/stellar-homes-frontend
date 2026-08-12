/**
 * Validation rules for the KYC details.
 *
 * This module is deliberately free of React and browser APIs so the exact same
 * rules run in the browser (for instant feedback) and again on the server when
 * the submission arrives. Client-side validation is a convenience; the server
 * re-check is the one that counts.
 */

import { getCountry, getDocumentType } from "@/data/kycReference";
import type {
  KycDetails,
  KycDetailsField,
  KycFieldErrors,
} from "@/types/kyc";

export const MIN_AGE = 18;
/** Upper bound that catches mistyped birth years like `1090`. */
export const MAX_AGE = 120;

export const MAX_NAME_LENGTH = 120;

// Latin letters with accents, plus the separators that appear in legal names.
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '’.-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
/** E.164: a leading `+`, a non-zero country digit, then 7-14 more digits. */
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
/** Stellar public keys are 56 characters of base32 starting with `G`. */
const STELLAR_ADDRESS_PATTERN = /^G[A-Z2-7]{55}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Empty set of details, used to initialise the form. */
export const EMPTY_KYC_DETAILS: KycDetails = {
  fullName: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  countryCode: "",
  documentType: "",
  documentNumber: "",
  walletAddress: "",
};

/** Human labels, reused by the error summary and the review step. */
export const FIELD_LABELS: Record<KycDetailsField, string> = {
  fullName: "Full legal name",
  dateOfBirth: "Date of birth",
  email: "Email address",
  phone: "Phone number",
  countryCode: "Country of issue",
  documentType: "Document type",
  documentNumber: "Document number",
  walletAddress: "Stellar wallet address",
};

/**
 * Whole years between `dateOfBirth` and `reference`, both ISO dates.
 * Returns null when the date cannot be parsed.
 */
export function ageOn(dateOfBirth: string, reference: Date): number | null {
  if (!ISO_DATE_PATTERN.test(dateOfBirth)) return null;

  const born = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(born.getTime())) return null;

  let age = reference.getUTCFullYear() - born.getUTCFullYear();
  const monthDelta = reference.getUTCMonth() - born.getUTCMonth();
  // Not yet had this year's birthday.
  if (monthDelta < 0 || (monthDelta === 0 && reference.getUTCDate() < born.getUTCDate())) {
    age -= 1;
  }
  return age;
}

/** Trims and collapses runs of whitespace inside a value. */
export function normalise(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Validates one field, returning an error message or null.
 *
 * Some fields depend on others (a document number is only meaningful next to
 * its country and type), so the whole set of values is always passed in.
 */
export function validateField(
  field: KycDetailsField,
  values: KycDetails,
  reference: Date = new Date(),
): string | null {
  const value = normalise(values[field] ?? "");

  switch (field) {
    case "fullName": {
      if (!value) return "Enter your full legal name.";
      if (value.length < 3) return "Name looks too short.";
      if (value.length > MAX_NAME_LENGTH)
        return `Keep the name under ${MAX_NAME_LENGTH} characters.`;
      if (!value.includes(" "))
        return "Enter both your first and last name, as printed on your document.";
      if (!NAME_PATTERN.test(value))
        return "Use letters, spaces, hyphens and apostrophes only.";
      return null;
    }

    case "dateOfBirth": {
      if (!value) return "Enter your date of birth.";
      const age = ageOn(value, reference);
      if (age === null) return "Enter a valid date.";
      if (age < 0) return "Date of birth cannot be in the future.";
      if (age < MIN_AGE) return `You must be at least ${MIN_AGE} to apply.`;
      if (age > MAX_AGE) return "Check the year — that date looks incorrect.";
      return null;
    }

    case "email": {
      if (!value) return "Enter an email address.";
      if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address.";
      return null;
    }

    case "phone": {
      if (!value) return "Enter a phone number.";
      const compact = value.replace(/[\s()-]/g, "");
      if (!compact.startsWith("+"))
        return "Include the country code, e.g. +234 801 234 5678.";
      if (!PHONE_PATTERN.test(compact))
        return "Enter a valid international phone number.";
      return null;
    }

    case "countryCode": {
      if (!value) return "Select the country that issued your document.";
      if (!getCountry(value)) return "Select a supported country.";
      return null;
    }

    case "documentType": {
      if (!values.countryCode) return "Select a country first.";
      if (!value) return "Select the document you will upload.";
      if (!getDocumentType(values.countryCode, value))
        return "That document is not accepted for the selected country.";
      return null;
    }

    case "documentNumber": {
      if (!value) return "Enter the number printed on your document.";
      const documentType = getDocumentType(values.countryCode, values.documentType);
      // Without a known type there is no shape to check against; the
      // documentType error already tells the user what to fix.
      if (!documentType) return null;
      if (!new RegExp(documentType.pattern).test(value.toUpperCase()))
        return `That does not look like a valid ${documentType.label}. Example: ${documentType.placeholder}`;
      return null;
    }

    case "walletAddress": {
      if (!value) return "Enter the Stellar address to verify.";
      if (!STELLAR_ADDRESS_PATTERN.test(value.toUpperCase()))
        return "Enter a valid Stellar public key — 56 characters starting with G.";
      return null;
    }

    default:
      return null;
  }
}

/** Validates every field, returning only the ones that failed. */
export function validateDetails(
  values: KycDetails,
  reference: Date = new Date(),
): KycFieldErrors {
  const errors: KycFieldErrors = {};

  (Object.keys(FIELD_LABELS) as KycDetailsField[]).forEach((field) => {
    const error = validateField(field, values, reference);
    if (error) errors[field] = error;
  });

  return errors;
}

/** Trims every value and upper-cases the fields that are case-insensitive. */
export function normaliseDetails(values: KycDetails): KycDetails {
  return {
    ...values,
    fullName: normalise(values.fullName),
    dateOfBirth: values.dateOfBirth.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.replace(/[\s()-]/g, ""),
    countryCode: values.countryCode.trim().toUpperCase(),
    documentType: values.documentType.trim(),
    documentNumber: normalise(values.documentNumber).toUpperCase(),
    walletAddress: values.walletAddress.trim().toUpperCase(),
  };
}
