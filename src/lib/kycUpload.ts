/**
 * Document upload rules and the submission request.
 *
 * Like `kycValidation`, this module avoids React and browser-only APIs so the
 * API route can apply the exact same file rules to what actually arrives —
 * client-side checks are there to give fast feedback, not to be trusted.
 */

import { getDocumentType } from "@/data/kycReference";
import type {
  DocumentSlot,
  DocumentSlotSpec,
  IdDocumentType,
  KycDetails,
  KycSubmissionResponse,
} from "@/types/kyc";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** `accept` attribute for the file input. */
export const ACCEPT_ATTRIBUTE = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

export const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per image
export const MAX_TOTAL_BYTES = 24 * 1024 * 1024; // 24 MB per submission
/** Anything smaller is almost certainly a truncated or empty file. */
export const MIN_FILE_BYTES = 10 * 1024;

/** The subset of `File` these checks need, so Node and the DOM both satisfy it. */
export interface FileLike {
  name: string;
  size: number;
  type: string;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validates one image, returning an error message or null. */
export function validateDocumentFile(file: FileLike): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Upload a JPG, PNG or WebP image.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return `That image is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_FILE_BYTES)}.`;
  }
  if (file.size < MIN_FILE_BYTES) {
    return "That file looks empty or corrupted. Try taking the photo again.";
  }
  return null;
}

/**
 * The upload slots for a given document type.
 *
 * Card-style IDs carry data on both faces, so the reverse is required; a
 * passport only needs its bio-data page. A selfie is always required — it is
 * what ties the document to the person submitting it.
 */
export function getDocumentSlots(
  documentType: IdDocumentType | undefined,
): DocumentSlotSpec[] {
  const isPassport = documentType?.requiresBackImage === false;

  return [
    {
      id: "front",
      label: isPassport ? "Bio-data page" : "Front of document",
      description: isPassport
        ? "The photo page showing your name, number and expiry date."
        : "The side showing your photo, name and document number.",
      required: true,
    },
    {
      id: "back",
      label: "Back of document",
      description: "The reverse side, showing any machine-readable strip.",
      required: documentType?.requiresBackImage ?? false,
    },
    {
      id: "selfie",
      label: "Selfie holding your document",
      description: "Your face and the document must both be clearly readable.",
      required: true,
    },
  ];
}

/** Slots that must carry a file for the given document type. */
export function getRequiredSlots(
  documentType: IdDocumentType | undefined,
): DocumentSlot[] {
  return getDocumentSlots(documentType)
    .filter((slot) => slot.required)
    .map((slot) => slot.id);
}

/** Form-data keys, shared so the client and the route cannot drift apart. */
export const DOCUMENT_FIELD_NAMES: Record<DocumentSlot, string> = {
  front: "documentFront",
  back: "documentBack",
  selfie: "selfie",
};

/** Packs details and images into the multipart body the API expects. */
export function buildKycFormData(
  details: KycDetails,
  files: Partial<Record<DocumentSlot, File>>,
): FormData {
  const formData = new FormData();

  (Object.keys(details) as (keyof KycDetails)[]).forEach((field) => {
    formData.append(field, details[field]);
  });

  (Object.keys(DOCUMENT_FIELD_NAMES) as DocumentSlot[]).forEach((slot) => {
    const file = files[slot];
    if (file) formData.append(DOCUMENT_FIELD_NAMES[slot], file, file.name);
  });

  return formData;
}

/** Total size of the attached images. */
export function totalUploadBytes(files: Partial<Record<DocumentSlot, File>>): number {
  return Object.values(files).reduce((sum, file) => sum + (file?.size ?? 0), 0);
}

/**
 * Posts a submission and normalises anything that goes wrong into the same
 * `KycSubmissionResponse` shape the happy path uses, so callers never have to
 * deal with both an exception and a failure payload.
 */
export async function submitKycApplication(
  details: KycDetails,
  files: Partial<Record<DocumentSlot, File>>,
): Promise<KycSubmissionResponse> {
  try {
    const response = await fetch("/api/kyc", {
      method: "POST",
      body: buildKycFormData(details, files),
    });

    const payload = (await response.json()) as KycSubmissionResponse;

    if (!response.ok && payload?.ok !== false) {
      return { ok: false, message: "Submission failed. Please try again." };
    }
    return payload;
  } catch {
    return {
      ok: false,
      message:
        "We could not reach the verification service. Check your connection and try again.",
    };
  }
}

/** Convenience re-export so callers need only one import for slot lookups. */
export function getSlotsForSelection(
  countryCode: string,
  documentTypeId: string,
): DocumentSlotSpec[] {
  return getDocumentSlots(getDocumentType(countryCode, documentTypeId));
}
