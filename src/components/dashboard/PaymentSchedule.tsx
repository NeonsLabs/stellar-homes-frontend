"use client";

import React, { useMemo, useState } from "react";
import { InvoiceBadge } from "./StatusBadge";
import { formatDate, formatUsdc, truncateHash } from "@/lib/format";
import { invoiceTotal } from "@/lib/repayment";
import type { LoanPosition } from "@/lib/dashboard";
import type { Invoice, InvoiceStatus, Mortgage } from "@/types/dashboard";

const EXPLORER_TX_URL = "https://stellar.expert/explorer/testnet/tx";

const PAGE_SIZE = 12;

type FilterKey = "outstanding" | "paid" | "all";

const FILTERS: { key: FilterKey; label: string; matches: InvoiceStatus[] | null }[] = [
  { key: "outstanding", label: "Outstanding", matches: ["overdue", "due", "upcoming"] },
  { key: "paid", label: "Paid", matches: ["paid"] },
  { key: "all", label: "All", matches: null },
];

function SummaryCell({ label, value, tone = "text-white" }: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-base font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export interface PaymentScheduleProps {
  invoices: Invoice[];
  position: LoanPosition;
  mortgage: Mortgage;
  /**
   * The only invoice that can be settled right now — the oldest unpaid one.
   * Later instalments stay locked so arrears are always cleared in order.
   */
  payableInvoiceId: string | null;
  onPay: (invoice: Invoice) => void;
}

/**
 * Full amortization schedule as borrower-facing invoices, with the
 * principal/interest split per period and a pay action on the next one due.
 */
export default function PaymentSchedule({
  invoices,
  position,
  mortgage,
  payableInvoiceId,
  onPay,
}: PaymentScheduleProps) {
  const [filter, setFilter] = useState<FilterKey>("outstanding");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const matches = FILTERS.find((entry) => entry.key === filter)?.matches;
    const rows = matches
      ? invoices.filter((invoice) => matches.includes(invoice.status))
      : invoices;

    // Settled instalments read best newest-first; everything else stays in
    // chronological order so the next payment sits at the top.
    return filter === "paid" ? [...rows].reverse() : rows;
  }, [filter, invoices]);

  const visible = filtered.slice(0, visibleCount);

  function selectFilter(key: FilterKey) {
    setFilter(key);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            MortgagePool
          </span>
          <h2 className="text-2xl font-bold text-white">Payment schedule</h2>
          <p className="text-sm text-slate-400">
            {mortgage.termMonths} monthly instalments at a fixed{" "}
            {(mortgage.annualRate * 100).toFixed(2)}% APR.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter invoices by status"
          className="flex flex-wrap gap-1 rounded-2xl border border-white/5 bg-white/5 p-1"
        >
          {FILTERS.map((entry) => (
            <button
              key={entry.key}
              role="tab"
              type="button"
              aria-selected={filter === entry.key}
              onClick={() => selectFilter(entry.key)}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                filter === entry.key
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-3xl">
        <div className="grid grid-cols-2 gap-4 border-b border-white/5 p-6 md:grid-cols-4">
          <SummaryCell
            label="Repaid to date"
            value={formatUsdc(position.totalPaid, true)}
            tone="text-emerald-400"
          />
          <SummaryCell
            label="Interest paid"
            value={formatUsdc(position.interestPaid, true)}
          />
          <SummaryCell
            label="Outstanding principal"
            value={formatUsdc(position.outstandingPrincipal, true)}
          />
          <SummaryCell
            label="Owed now"
            value={formatUsdc(position.amountOwedNow)}
            tone={position.overdueInvoices.length > 0 ? "text-rose-400" : "text-sky-400"}
          />
        </div>

        {/* Stacked cards on phones; the wide table takes over from md up and
            scrolls inside its own container rather than the page. */}
        <ul className="divide-y divide-white/5 md:hidden">
          {visible.map((invoice) => {
            const payable = invoice.id === payableInvoiceId;

            return (
              <li
                key={invoice.id}
                className={`space-y-3 p-5 ${invoice.status === "overdue" ? "bg-rose-500/[0.06]" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs whitespace-nowrap text-slate-300">
                      {invoice.reference}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Due {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <InvoiceBadge status={invoice.status} />
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold tabular-nums text-white">
                      {formatUsdc(invoiceTotal(invoice))}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatUsdc(invoice.principal)} principal ·{" "}
                      {formatUsdc(invoice.interest)} interest
                      {invoice.lateFee > 0 && (
                        <span className="text-rose-300">
                          {" "}
                          · {formatUsdc(invoice.lateFee)} fee
                        </span>
                      )}
                    </p>
                  </div>

                  {invoice.status === "paid" ? (
                    invoice.paymentTxHash ? (
                      <a
                        href={`${EXPLORER_TX_URL}/${invoice.paymentTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs whitespace-nowrap text-sky-400 underline-offset-4 hover:underline"
                      >
                        {truncateHash(invoice.paymentTxHash, 6, 4)}
                      </a>
                    ) : null
                  ) : payable ? (
                    <button
                      type="button"
                      onClick={() => onPay(invoice)}
                      className="rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-bold whitespace-nowrap text-white transition-colors hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      Pay now
                    </button>
                  ) : (
                    <span className="text-xs whitespace-nowrap text-slate-600">
                      Locked
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-sm">
            <caption className="sr-only">
              Monthly mortgage repayment schedule with principal and interest
              breakdown per instalment
            </caption>
            <thead>
              <tr className="border-b border-white/5 text-left text-xs tracking-wide text-slate-500 uppercase">
                <th scope="col" className="px-6 py-3 font-semibold">Invoice</th>
                <th scope="col" className="px-6 py-3 font-semibold">Due date</th>
                <th scope="col" className="px-6 py-3 text-right font-semibold">Principal</th>
                <th scope="col" className="px-6 py-3 text-right font-semibold">Interest</th>
                <th scope="col" className="px-6 py-3 text-right font-semibold">Total</th>
                <th scope="col" className="px-6 py-3 text-right font-semibold">Balance after</th>
                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                <th scope="col" className="px-6 py-3 text-right font-semibold">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visible.map((invoice) => {
                const payable = invoice.id === payableInvoiceId;

                return (
                  <tr
                    key={invoice.id}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      invoice.status === "overdue" ? "bg-rose-500/[0.06]" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs whitespace-nowrap text-slate-300">
                        {invoice.reference}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Instalment {invoice.period}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-slate-300">
                      {formatUsdc(invoice.principal)}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-slate-300">
                      {formatUsdc(invoice.interest)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-white">
                      {formatUsdc(invoiceTotal(invoice))}
                      {invoice.lateFee > 0 && (
                        <span className="block text-[11px] font-normal text-rose-300">
                          incl. {formatUsdc(invoice.lateFee)} fee
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-slate-400">
                      {formatUsdc(invoice.balanceAfter, true)}
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.status === "paid" ? (
                        invoice.paymentTxHash ? (
                          <a
                            href={`${EXPLORER_TX_URL}/${invoice.paymentTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-sky-400 underline-offset-4 hover:underline"
                          >
                            {truncateHash(invoice.paymentTxHash, 6, 4)}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )
                      ) : payable ? (
                        <button
                          type="button"
                          onClick={() => onPay(invoice)}
                          className="rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-bold whitespace-nowrap text-white transition-colors hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                        >
                          Pay now
                        </button>
                      ) : (
                        <span
                          className="text-xs whitespace-nowrap text-slate-600"
                          title="Earlier instalments must be settled first"
                        >
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 px-6 py-4 sm:flex-row">
          <p className="text-xs text-slate-500">
            Showing {visible.length} of {filtered.length} instalments
          </p>
          {visibleCount < filtered.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
