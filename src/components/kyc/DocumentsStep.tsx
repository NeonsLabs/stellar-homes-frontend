"use client";

import React from "react";
import DocumentUploader from "./DocumentUploader";
import { MAX_TOTAL_BYTES, formatBytes } from "@/lib/kycUpload";
import type {
  DocumentErrors,
  DocumentSlot,
  DocumentSlotSpec,
  IdDocumentType,
  UploadedDocument,
} from "@/types/kyc";

export interface DocumentsStepProps {
  /** The document the applicant said they would upload. */
  documentType: IdDocumentType | undefined;
  slots: DocumentSlotSpec[];
  documents: Partial<Record<DocumentSlot, UploadedDocument>>;
  errors: DocumentErrors;
  /** Set when the combined upload exceeds the per-submission limit. */
  totalSizeError?: string;
  onSelect: (slot: DocumentSlot, file: File) => void;
  onRemove: (slot: DocumentSlot) => void;
  onBack: () => void;
  onContinue: () => void;
}

/** Upload step: one drop zone per required image, plus photo guidance. */
export default function DocumentsStep({
  documentType,
  slots,
  documents,
  errors,
  totalSizeError,
  onSelect,
  onRemove,
  onBack,
  onContinue,
}: DocumentsStepProps) {
  const usedBytes = Object.values(documents).reduce(
    (sum, document) => sum + (document?.file.size ?? 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h3 className="text-sm font-bold tracking-wide text-white uppercase">
          Upload your {documentType?.label ?? "identity document"}
        </h3>
        <p className="text-xs text-slate-500">
          Photograph the original document — scans, screenshots and photocopies are
          rejected at review.
        </p>
      </div>

      <ul className="grid gap-2 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-xs text-slate-400 sm:grid-cols-2">
        <li className="flex gap-2">
          <span className="text-emerald-400" aria-hidden="true">✓</span>
          All four corners visible
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-400" aria-hidden="true">✓</span>
          Text sharp and in focus
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-400" aria-hidden="true">✓</span>
          No glare covering the details
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-400" aria-hidden="true">✓</span>
          Document not expired
        </li>
      </ul>

      <div className="space-y-6">
        {slots.map((slot) => (
          <DocumentUploader
            key={slot.id}
            slot={slot}
            value={documents[slot.id]}
            error={errors[slot.id]}
            onSelect={(file) => onSelect(slot.id, file)}
            onRemove={() => onRemove(slot.id)}
          />
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-500">
          {formatBytes(usedBytes)} of {formatBytes(MAX_TOTAL_BYTES)} used
        </p>
        {totalSizeError && (
          <p role="alert" className="text-xs text-rose-400">
            {totalSizeError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          Continue to review
        </button>
      </div>
    </div>
  );
}
