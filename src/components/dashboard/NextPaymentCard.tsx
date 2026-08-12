import React from "react";
import { InvoiceBadge } from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import { daysBetween, formatDate, formatDayOffset, formatUsdc } from "@/lib/format";
import { invoiceTotal } from "@/lib/repayment";
import type { LoanPosition } from "@/lib/dashboard";
import type { Invoice, Mortgage } from "@/types/dashboard";

export interface NextPaymentCardProps {
  /** The earliest unsettled instalment, or null once the loan is repaid. */
  invoice: Invoice | null;
  position: LoanPosition;
  mortgage: Mortgage;
  asOf: string;
  onPay: (invoice: Invoice) => void;
}

/**
 * The dashboard's call to action: what the borrower owes next, split into
 * principal and interest, with the repayment flow one click away.
 */
export default function NextPaymentCard({
  invoice,
  position,
  mortgage,
  asOf,
  onPay,
}: NextPaymentCardProps) {
  if (!invoice) {
    return (
      <div className="glass-panel glass-card-glow rounded-3xl p-8 text-center">
        <h3 className="text-xl font-bold text-white">Mortgage fully repaid</h3>
        <p className="mt-2 text-sm text-slate-400">
          Every instalment has settled. Your PROP collateral has been unlocked and
          returned to your wallet.
        </p>
      </div>
    );
  }

  const total = invoiceTotal(invoice);
  const offset = daysBetween(asOf, invoice.dueDate);
  const isOverdue = invoice.status === "overdue";
  const hasExtraDue = position.amountOwedNow > total;

  return (
    <div
      className={`glass-panel glass-card-glow relative overflow-hidden rounded-3xl p-6 md:p-8 ${
        isOverdue ? "border-rose-500/30" : ""
      }`}
    >
      <div
        className={`pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl ${
          isOverdue ? "bg-rose-500/10" : "bg-emerald-500/10"
        }`}
        aria-hidden="true"
      />

      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              {isOverdue ? "Payment overdue" : "Next payment"}
            </p>
            <p className="text-3xl font-extrabold text-white">{formatUsdc(total)}</p>
            <p className="text-sm text-slate-400">
              Due {formatDate(invoice.dueDate)} · {formatDayOffset(offset)}
            </p>
          </div>
          <InvoiceBadge status={invoice.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-500">Principal</p>
            <p className="text-sm font-bold text-slate-200">
              {formatUsdc(invoice.principal)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-500">Interest</p>
            <p className="text-sm font-bold text-slate-200">
              {formatUsdc(invoice.interest)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-500">Late fee</p>
            <p
              className={`text-sm font-bold ${invoice.lateFee > 0 ? "text-rose-300" : "text-slate-200"}`}
            >
              {formatUsdc(invoice.lateFee)}
            </p>
          </div>
        </div>

        {hasExtraDue && (
          <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {formatUsdc(position.amountOwedNow)} is owed across all outstanding
            instalments. Settle the oldest first to clear your arrears.
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Term progress</span>
            <span className="font-semibold text-slate-200">
              {position.paidCount} of {mortgage.termMonths} instalments
            </span>
          </div>
          <ProgressBar
            value={position.repaymentProgress}
            tone="emerald"
            size="sm"
            label="Repayment term progress"
          />
        </div>

        <button
          type="button"
          onClick={() => onPay(invoice)}
          className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 py-4 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          Pay {formatUsdc(total)} in USDC
        </button>
      </div>
    </div>
  );
}
