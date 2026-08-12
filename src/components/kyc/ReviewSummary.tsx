import React from "react";
import { getCountry, getDocumentType } from "@/data/kycReference";
import { FIELD_LABELS } from "@/lib/kycValidation";
import type { KycDetails } from "@/types/kyc";

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

export interface ReviewSummaryProps {
  details: KycDetails;
  /** Sends the user back to the details step to correct an answer. */
  onEdit: () => void;
}

/** Read-only recap of the captured identity details. */
export default function ReviewSummary({ details, onEdit }: ReviewSummaryProps) {
  const country = getCountry(details.countryCode);
  const documentType = getDocumentType(details.countryCode, details.documentType);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold tracking-wide text-white uppercase">
          Identity details
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          Edit details
        </button>
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
  );
}
