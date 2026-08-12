"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Modal from "./Modal";
import { Badge } from "./StatusBadge";
import { daysBetween, formatDate, formatDayOffset, formatUsdc, truncateHash } from "@/lib/format";
import {
  invoiceTotal,
  requestSignature,
  submitRepayment,
  type RepaymentReceipt,
  type RepaymentStage,
} from "@/lib/repayment";
import type { BorrowerProfile, Invoice, Mortgage } from "@/types/dashboard";

const EXPLORER_TX_URL = "https://stellar.expert/explorer/testnet/tx";

const STEPS: { stage: RepaymentStage; label: string }[] = [
  { stage: "review", label: "Review" },
  { stage: "signing", label: "Sign" },
  { stage: "submitting", label: "Settle" },
];

function Spinner() {
  return (
    <svg className="h-10 w-10 animate-spin text-sky-400" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M12 2a10 10 0 0110 10h-3a7 7 0 00-7-7V2z"
      />
    </svg>
  );
}

/** Horizontal Review → Sign → Settle indicator. */
function StageSteps({ stage }: { stage: RepaymentStage }) {
  const currentIndex =
    stage === "success" ? STEPS.length : STEPS.findIndex((step) => step.stage === stage);

  return (
    <ol className="flex items-center gap-2" aria-label="Repayment progress">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <li key={step.stage} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                done
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : active
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-300"
                    : "border-white/10 bg-white/5 text-slate-500"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : index + 1}
            </span>
            <span
              className={`text-xs font-semibold ${
                done ? "text-emerald-300" : active ? "text-sky-300" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <span
                className={`h-px flex-1 ${done ? "bg-emerald-500/40" : "bg-white/10"}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function BreakdownRow({
  label,
  value,
  hint,
  emphasis = false,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
  tone?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className={`text-sm ${emphasis ? "font-bold text-white" : "text-slate-400"}`}>
          {label}
        </p>
        {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      </div>
      <p
        className={`shrink-0 tabular-nums ${
          emphasis ? "text-lg font-extrabold text-white" : `text-sm font-semibold ${tone ?? "text-slate-200"}`
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export interface RepaymentModalProps {
  invoice: Invoice;
  borrower: BorrowerProfile;
  mortgage: Mortgage;
  /** Snapshot date, stamped on the receipt and used for due-date wording. */
  asOf: string;
  /** Due date of the following instalment, shown on the receipt. */
  nextDueDate: string | null;
  onClose: () => void;
  onPaid: (invoiceId: string, receipt: RepaymentReceipt) => void;
}

/**
 * Guided repayment flow for a single monthly invoice.
 *
 * Walks the borrower through the amount breakdown, the wallet signature and
 * network settlement, then shows an on-chain receipt. The dialog cannot be
 * dismissed while a transaction is in flight so a repayment is never left in
 * an ambiguous state.
 */
export default function RepaymentModal({
  invoice,
  borrower,
  mortgage,
  asOf,
  nextDueDate,
  onClose,
  onPaid,
}: RepaymentModalProps) {
  const [stage, setStage] = useState<RepaymentStage>("review");
  const [receipt, setReceipt] = useState<RepaymentReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Guards against setting state after the borrower navigates away mid-flight.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const total = invoiceTotal(invoice);
  const balanceAfter = borrower.usdcBalance - total;
  const insufficientFunds = total > borrower.usdcBalance;
  const inFlight = stage === "signing" || stage === "submitting";
  const dueOffset = daysBetween(asOf, invoice.dueDate);

  async function pay() {
    setErrorMessage(null);
    setStage("signing");

    try {
      await requestSignature();
      if (!alive.current) return;

      setStage("submitting");
      const settled = await submitRepayment({
        invoice,
        amount: total,
        walletBalance: borrower.usdcBalance,
        settlementDate: asOf,
      });
      if (!alive.current) return;

      setReceipt(settled);
      setStage("success");
      onPaid(invoice.id, settled);
    } catch (error) {
      if (!alive.current) return;
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The repayment could not be submitted. Please try again.",
      );
      setStage("error");
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descriptionId}
      size="lg"
      dismissible={!inFlight}
    >
      <div className="border-b border-white/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-white">
              {stage === "success" ? "Repayment settled" : "Pay monthly invoice"}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-slate-400">
              {invoice.reference} · instalment {invoice.period} of {mortgage.termMonths}
            </p>
          </div>
          {!inFlight && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              aria-label="Close repayment dialog"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-5">
          <StageSteps stage={stage} />
        </div>
      </div>

      {stage === "review" && (
        <div className="space-y-5 p-6">
          {invoice.status === "overdue" && (
            <div className="flex gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
              <svg className="h-5 w-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-rose-300">
                  This instalment was due {formatDayOffset(dueOffset)}
                </p>
                <p className="mt-0.5 text-rose-200/70">
                  A late fee of {formatUsdc(invoice.lateFee)} has been added. Prolonged
                  arrears can trigger liquidation of your PROP collateral.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-2">
            <BreakdownRow
              label="Principal"
              value={formatUsdc(invoice.principal)}
              hint="Returned to the MortgagePool"
            />
            <div className="border-t border-white/5" />
            <BreakdownRow
              label="Interest"
              value={formatUsdc(invoice.interest)}
              hint={`Paid to pool investors · ${(mortgage.annualRate * 100).toFixed(2)}% APR`}
            />
            {invoice.lateFee > 0 && (
              <>
                <div className="border-t border-white/5" />
                <BreakdownRow
                  label="Late fee"
                  value={formatUsdc(invoice.lateFee)}
                  hint="Applied after the due date"
                  tone="text-rose-300"
                />
              </>
            )}
            <div className="border-t border-white/10" />
            <BreakdownRow label="Total due" value={formatUsdc(total)} emphasis />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">Due date</p>
              <p className="font-semibold text-white">{formatDate(invoice.dueDate)}</p>
              <p className="text-[11px] text-slate-500">{formatDayOffset(dueOffset)}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">Principal after payment</p>
              <p className="font-semibold text-white">{formatUsdc(invoice.balanceAfter, true)}</p>
              <p className="text-[11px] text-slate-500">Outstanding to the pool</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h5M3 8a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Pay from wallet</p>
                  <p className="font-mono text-[11px] text-slate-500">
                    {truncateHash(borrower.walletAddress, 6, 6)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {formatUsdc(borrower.usdcBalance)}
                </p>
                <p className="text-[11px] text-slate-500">USDC available</p>
              </div>
            </div>

            {insufficientFunds ? (
              <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                Short by {formatUsdc(total - borrower.usdcBalance)}. Top up your wallet to
                settle this invoice.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Balance after payment: {formatUsdc(balanceAfter)}
              </p>
            )}
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            Calls <span className="font-mono text-slate-400">repay()</span> on MortgagePool{" "}
            <span className="font-mono">{truncateHash(mortgage.poolContract, 4, 4)}</span>. Your
            PROP collateral is released automatically once the final instalment clears.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={pay}
              disabled={insufficientFunds}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-[2]"
            >
              Sign &amp; pay {formatUsdc(total)}
            </button>
          </div>
        </div>
      )}

      {inFlight && (
        <div className="flex flex-col items-center gap-4 p-10 text-center">
          <Spinner />
          <div>
            <p className="text-lg font-bold text-white">
              {stage === "signing"
                ? "Approve in your wallet"
                : "Submitting to the Stellar network"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {stage === "signing"
                ? `Confirm the ${formatUsdc(total)} USDC transfer in your connected wallet.`
                : "Waiting for settlement — this usually takes under 5 seconds."}
            </p>
          </div>
          <Badge tone="amber" dot pulse>
            Do not close this window
          </Badge>
        </div>
      )}

      {stage === "success" && receipt && (
        <div className="space-y-5 p-6">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{formatUsdc(receipt.amount)}</p>
              <p className="text-sm text-slate-400">
                settled on {formatDate(receipt.settledAt)}
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-2">
            <BreakdownRow label="Invoice" value={invoice.reference} />
            <BreakdownRow
              label="Remaining principal"
              value={formatUsdc(invoice.balanceAfter, true)}
            />
            <BreakdownRow
              label="Next instalment due"
              value={nextDueDate ? formatDate(nextDueDate) : "Loan fully repaid"}
            />
          </div>

          <a
            href={`${EXPLORER_TX_URL}/${receipt.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
          >
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Transaction hash</p>
              <p className="truncate font-mono text-xs text-sky-400">
                {truncateHash(receipt.txHash, 14, 10)}
              </p>
            </div>
            <span className="ml-3 shrink-0 text-xs font-semibold text-slate-400">
              View on explorer ↗
            </span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Done
          </button>
        </div>
      )}

      {stage === "error" && (
        <div className="space-y-5 p-6">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/15 text-rose-400">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-white">Repayment failed</p>
              <p className="mt-1 text-sm text-slate-400">{errorMessage}</p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            No USDC has left your wallet — the invoice is still outstanding.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:flex-1"
            >
              Close
            </button>
            <button
              type="button"
              onClick={pay}
              className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:flex-[2]"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
