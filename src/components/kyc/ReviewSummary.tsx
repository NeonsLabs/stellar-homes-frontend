import React from "react";
import { getCountry, getDocumentType } from "@/data/kycReference";
import { FIELD_LABELS } from "@/lib/kycValidation";
import { formatBytes } from "@/lib/kycUpload";
import type {
  DocumentSlot,
  DocumentSlotSpec,
  KycDetails,
  UploadedDocument,
} from "@/types/kyc";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-xs text-slate-500 sm:shrink-0">{label}</dt>
      <dd className="text-sm font-semibold break-all text-slate-200 sm:text-right">
        {value || "—"}
      </dd>
    </div>
  );
}

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      {label}
    </button>
  );
}

export interface ReviewSummaryProps {
  details: KycDetails;
  /** Upload slots relevant to the chosen document type. */
  slots: DocumentSlotSpec[];
  documents: Partial<Record<DocumentSlot, UploadedDocument>>;
  /** Sends the user back to the details step to correct an answer. */
  onEdit: () => void;
  /** Sends the user back to the upload step. */
  onEditDocuments: () => void;
}

/** Read-only recap of everything about to be submitted. */
export default function ReviewSummary({
  details,
  slots,
  documents,
  onEdit,
  onEditDocuments,
}: ReviewSummaryProps) {
  const country = getCountry(details.countryCode);
  const documentType = getDocumentType(details.countryCode, details.documentType);
  const attached = slots.filter((slot) => documents[slot.id]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-bold tracking-wide text-white uppercase">
            Identity details
          </h3>
          <EditButton onClick={onEdit} label="Edit details" />
        </div>

        <dl className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-white/[0.03] px-4">
          <Row label={FIELD_LABELS.fullName} value={details.fullName} />
          <Row label={FIELD_LABELS.dateOfBirth} value={details.dateOfBirth} />
          <Row label={FIELD_LABELS.email} value={details.email} />
          <Row label={FIELD_LABELS.phone} value={details.phone} />
          <Row label={FIELD_LABELS.countryCode} value={country?.name ?? details.countryCode} />
          <Row
            label={FIELD_LABELS.documentType}
            value={documentType?.label ?? details.documentType}
          />
          <Row label={FIELD_LABELS.documentNumber} value={details.documentNumber} />
          <Row label={FIELD_LABELS.walletAddress} value={details.walletAddress} />
        </dl>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-bold tracking-wide text-white uppercase">
            Attached documents
          </h3>
          <EditButton onClick={onEditDocuments} label="Edit documents" />
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {attached.map((slot) => {
            const document = documents[slot.id]!;
            return (
              <li
                key={slot.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                {/* Object-URL previews cannot go through the Next image
                    optimiser, so this stays a plain img. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={document.previewUrl}
                  alt={`Preview of the ${slot.label.toLowerCase()} you uploaded`}
                  className="h-28 w-full object-cover"
                />
                <div className="space-y-0.5 p-3">
                  <p className="text-xs font-semibold text-slate-200">{slot.label}</p>
                  <p className="truncate text-[11px] text-slate-500" title={document.file.name}>
                    {document.file.name}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {formatBytes(document.file.size)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
