"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { KycSubmissionSuccess } from "@/types/kyc";

const NEXT_STEPS = [
  "Our compliance team checks your document against the issuing registry.",
  "You receive an email at the address you gave as soon as a decision is made.",
  "Once approved, your Stellar account is authorised to hold PROP tokens.",
];

/** Confirmation screen shown after a submission is accepted. */
export default function SubmissionSuccess({
  result,
  email,
}: {
  result: KycSubmissionSuccess;
  email: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked; the reference stays selectable.
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Application submitted</h2>
          <p className="mt-1 text-sm text-slate-400">
            We will email {email} within about {result.estimatedReviewHours} hours.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">Your reference</p>
          <p className="font-mono text-lg font-bold text-white">{result.reference}</p>
        </div>
        <button
          type="button"
          onClick={copyReference}
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {copied ? "Copied" : "Copy reference"}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-wide text-white uppercase">
          What happens next
        </h3>
        <ol className="space-y-3">
          {NEXT_STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-slate-400">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-slate-400">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <Link
        href="/"
        className="block rounded-xl bg-white/10 px-5 py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        Back to StellarHomes
      </Link>
    </div>
  );
}
