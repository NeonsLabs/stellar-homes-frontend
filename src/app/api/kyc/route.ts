/**
 * KYC submission endpoint.
 *
 * Accepts the multipart payload produced by `buildKycFormData`, re-runs every
 * rule the browser already applied, and queues the application for manual
 * review. The client-side checks exist for fast feedback; these are the ones
 * that decide whether a submission is accepted.
 *
 * Persisting the images (to S3, IPFS or a compliance vendor) is the one piece
 * left to the backend team — the hand-off point is marked below.
 */

import { NextResponse } from "next/server";
import { getDocumentType } from "@/data/kycReference";
import { normaliseDetails, validateDetails } from "@/lib/kycValidation";
import {
  DOCUMENT_FIELD_NAMES,
  MAX_TOTAL_BYTES,
  formatBytes,
  getRequiredSlots,
  validateDocumentFile,
} from "@/lib/kycUpload";
import type {
  DocumentErrors,
  DocumentSlot,
  KycDetails,
  KycSubmissionResponse,
} from "@/types/kyc";

/** Hours quoted back to the applicant for a manual review. */
const ESTIMATED_REVIEW_HOURS = 24;

const DETAIL_FIELDS: (keyof KycDetails)[] = [
  "fullName",
  "dateOfBirth",
  "email",
  "phone",
  "countryCode",
  "documentType",
  "documentNumber",
  "walletAddress",
];

function reject(
  body: Omit<Extract<KycSubmissionResponse, { ok: false }>, "ok">,
  status = 400,
) {
  return NextResponse.json<KycSubmissionResponse>({ ok: false, ...body }, { status });
}

/** `KYC-NG-4F2A9C` — short enough to read out over the phone. */
function createReference(countryCode: string): string {
  const suffix = globalThis.crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();
  return `KYC-${countryCode || "XX"}-${suffix}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return reject({ message: "Expected a multipart form submission." });
  }

  // --- Details -------------------------------------------------------------
  const rawDetails = DETAIL_FIELDS.reduce((accumulator, field) => {
    const value = formData.get(field);
    accumulator[field] = typeof value === "string" ? value : "";
    return accumulator;
  }, {} as KycDetails);

  const details = normaliseDetails(rawDetails);
  const fieldErrors = validateDetails(details);

  if (Object.keys(fieldErrors).length > 0) {
    return reject({
      message: "Some of your details need correcting.",
      fieldErrors,
    });
  }

  // --- Documents -----------------------------------------------------------
  const documentType = getDocumentType(details.countryCode, details.documentType);
  const requiredSlots = getRequiredSlots(documentType);
  const documentErrors: DocumentErrors = {};
  let totalBytes = 0;

  (Object.keys(DOCUMENT_FIELD_NAMES) as DocumentSlot[]).forEach((slot) => {
    const entry = formData.get(DOCUMENT_FIELD_NAMES[slot]);
    const isFile = entry instanceof File;

    if (!isFile || entry.size === 0) {
      if (requiredSlots.includes(slot)) {
        documentErrors[slot] = "This image is required.";
      }
      return;
    }

    const error = validateDocumentFile(entry);
    if (error) {
      documentErrors[slot] = error;
      return;
    }

    totalBytes += entry.size;
  });

  if (Object.keys(documentErrors).length > 0) {
    return reject({
      message: "Some of your documents could not be accepted.",
      documentErrors,
    });
  }

  if (totalBytes > MAX_TOTAL_BYTES) {
    return reject({
      message: `Your uploads total ${formatBytes(totalBytes)} — the limit is ${formatBytes(MAX_TOTAL_BYTES)} per submission.`,
    });
  }

  // --- Hand-off ------------------------------------------------------------
  // TODO(backend): persist the images to the compliance vault and enqueue the
  // application for review. Until then the submission is accepted and the
  // reference is returned so the flow can be exercised end to end.

  const response: KycSubmissionResponse = {
    ok: true,
    reference: createReference(details.countryCode),
    status: "pending_review",
    submittedAt: new Date().toISOString(),
    estimatedReviewHours: ESTIMATED_REVIEW_HOURS,
  };

  return NextResponse.json(response, { status: 201 });
}

/** Anything other than POST is not supported on this endpoint. */
export function GET(): NextResponse {
  return NextResponse.json(
    { ok: false, message: "Use POST to submit a KYC application." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
