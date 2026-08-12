/**
 * Domain types for the KYC submission flow.
 *
 * StellarHomes issues PROP tokens with the `AUTH_REQUIRED` flag, so a wallet
 * cannot hold property equity until its owner has passed identity
 * verification. These types describe what the borrower submits for that check.
 */

/** Steps of the submission wizard, in order. */
export type KycStep = "details" | "documents" | "review";

/** The document images a submission can carry. */
export type DocumentSlot = "front" | "back" | "selfie";

/** One upload slot presented to the user. */
export interface DocumentSlotSpec {
  id: DocumentSlot;
  label: string;
  description: string;
  required: boolean;
}

/** A chosen file plus the object URL rendering its preview. */
export interface UploadedDocument {
  file: File;
  /** `URL.createObjectURL(file)` — revoked when the file is replaced. */
  previewUrl: string;
}

export type DocumentErrors = Partial<Record<DocumentSlot, string>>;

/** The text fields captured before any document is uploaded. */
export interface KycDetails {
  /** Full legal name, exactly as printed on the identity document. */
  fullName: string;
  /** ISO-8601 `YYYY-MM-DD`. */
  dateOfBirth: string;
  email: string;
  /** E.164 format, e.g. `+2348012345678`. */
  phone: string;
  /** ISO 3166-1 alpha-2 code of the country that issued the document. */
  countryCode: string;
  /** Id of an `IdDocumentType` offered by the selected country. */
  documentType: string;
  documentNumber: string;
  /** Stellar account the verified PROP trustline will be authorised for. */
  walletAddress: string;
}

export type KycDetailsField = keyof KycDetails;

/** Validation messages keyed by field; absent key means the field is valid. */
export type KycFieldErrors = Partial<Record<KycDetailsField, string>>;

/** An identity document accepted for a given country. */
export interface IdDocumentType {
  id: string;
  label: string;
  /**
   * Source of the regular expression the document number must match.
   * Stored as a string so the reference data stays JSON-serialisable.
   */
  pattern: string;
  /** Example of a well-formed number, shown in the input. */
  placeholder: string;
  /** Short explanation of where to find the number on the document. */
  hint: string;
  /**
   * Whether the reverse side must also be uploaded. Card-style IDs carry data
   * on both faces; passports only need the bio-data page.
   */
  requiresBackImage: boolean;
}

export interface SupportedCountry {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  name: string;
  /** International dialling prefix, used to prefill the phone field. */
  dialCode: string;
  documentTypes: IdDocumentType[];
}

/** Accepted submission — the application is queued for manual review. */
export interface KycSubmissionSuccess {
  ok: true;
  /** Reference the applicant quotes when chasing their application. */
  reference: string;
  status: "pending_review";
  /** ISO-8601 timestamp the submission was accepted. */
  submittedAt: string;
  estimatedReviewHours: number;
}

/** Rejected submission, with per-field detail where the server can give it. */
export interface KycSubmissionFailure {
  ok: false;
  message: string;
  fieldErrors?: KycFieldErrors;
  documentErrors?: DocumentErrors;
}

export type KycSubmissionResponse = KycSubmissionSuccess | KycSubmissionFailure;
