"use client";

import React, { useCallback, useMemo, useState } from "react";
import MilestoneTracker from "./MilestoneTracker";
import NextPaymentCard from "./NextPaymentCard";
import PaymentSchedule from "./PaymentSchedule";
import ProgressBar from "./ProgressBar";
import PropertyOverview from "./PropertyOverview";
import RepaymentModal from "./RepaymentModal";
import StatTile from "./StatTile";
import { formatUsdc } from "@/lib/format";
import { getBuildProgress, getLoanPosition } from "@/lib/dashboard";
import type { RepaymentReceipt } from "@/lib/repayment";
import type { BorrowerDashboardData, Invoice } from "@/types/dashboard";

/**
 * Client shell for the borrower dashboard.
 *
 * Owns the interactive state that spans sections (milestone filters live in
 * the tracker itself) and derives the headline figures from a single source so
 * the tiles can never disagree with the sections below them.
 */
export default function BorrowerDashboard({
  data,
}: {
  data: BorrowerDashboardData;
}) {
  const { asOf, borrower, property, mortgage, escrow, milestones } = data;

  // Invoices are the one mutable slice of the dashboard: settling one flips it
  // to paid, and every derived figure recomputes from there.
  const [invoices, setInvoices] = useState<Invoice[]>(data.invoices);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  const buildProgress = useMemo(() => getBuildProgress(milestones), [milestones]);
  const position = useMemo(
    () => getLoanPosition(invoices, mortgage),
    [invoices, mortgage],
  );

  /** Due date of the instalment following the one being paid. */
  const nextDueDate = useMemo(() => {
    if (!payingInvoice) return null;
    return (
      invoices.find(
        (invoice) =>
          invoice.period > payingInvoice.period && invoice.status !== "paid",
      )?.dueDate ?? null
    );
  }, [invoices, payingInvoice]);

  const handlePaid = useCallback(
    (invoiceId: string, receipt: RepaymentReceipt) => {
      setInvoices((current) =>
        current.map((invoice) =>
          invoice.id === invoiceId
            ? {
                ...invoice,
                status: "paid" as const,
                paidAt: receipt.settledAt,
                paymentTxHash: receipt.txHash,
              }
            : invoice,
        ),
      );
    },
    [],
  );

  const awaitingVerification = milestones.filter(
    (milestone) => milestone.status === "verifying",
  ).length;

  return (
    <main className="relative mx-auto max-w-7xl space-y-10 px-6 py-10">
      <section id="overview" className="scroll-mt-24 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-slate-400">
            Welcome back, <span className="font-semibold text-white">{borrower.name.split(" ")[0]}</span>
          </p>
          <p className="text-xs text-slate-500">
            Here is where your build and your mortgage stand today.
          </p>
        </div>

        {position.overdueInvoices.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-rose-300">
                  {position.overdueInvoices.length === 1
                    ? "You have an overdue instalment"
                    : `You have ${position.overdueInvoices.length} overdue instalments`}
                </p>
                <p className="text-rose-200/70">
                  {formatUsdc(position.amountOwedNow)} is currently owed to the
                  MortgagePool.
                </p>
              </div>
            </div>
            <a
              href="#payments"
              className="shrink-0 rounded-xl bg-rose-500 px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-rose-600"
            >
              Review payments
            </a>
          </div>
        )}

        <PropertyOverview
          property={property}
          mortgage={mortgage}
          escrow={escrow}
          buildProgress={buildProgress}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Outstanding principal"
            value={formatUsdc(position.outstandingPrincipal, true)}
            hint={`of ${formatUsdc(mortgage.loanAmount, true)} borrowed`}
            accent="white"
            footer={
              <ProgressBar
                value={position.repaymentProgress}
                tone="sky"
                size="sm"
                label="Repayment term completed"
              />
            }
          />
          <StatTile
            label="Repaid to date"
            value={formatUsdc(position.totalPaid, true)}
            hint={`${position.paidCount} of ${mortgage.termMonths} instalments settled`}
            accent="emerald"
          />
          <StatTile
            label="Escrow released"
            value={formatUsdc(escrow.totalReleased, true)}
            hint={`${milestones.filter((milestone) => milestone.status === "released").length} of ${milestones.length} milestones verified`}
            accent="sky"
          />
          <StatTile
            label="Build completion"
            value={`${buildProgress.toFixed(1)}%`}
            hint={
              awaitingVerification > 0
                ? `${awaitingVerification} milestone awaiting oracle sign-off`
                : "All submitted proof verified"
            }
            accent="amber"
          />
        </div>
      </section>

      <MilestoneTracker milestones={milestones} />

      <section id="payments" className="scroll-mt-24 space-y-6">
        <NextPaymentCard
          invoice={position.nextInvoice}
          position={position}
          mortgage={mortgage}
          asOf={asOf}
          onPay={setPayingInvoice}
        />

        <PaymentSchedule
          invoices={invoices}
          position={position}
          mortgage={mortgage}
          payableInvoiceId={position.nextInvoice?.id ?? null}
          onPay={setPayingInvoice}
        />
      </section>

      {payingInvoice && (
        <RepaymentModal
          // Remount per invoice so the flow always opens on a clean review step.
          key={payingInvoice.id}
          invoice={payingInvoice}
          borrower={borrower}
          mortgage={mortgage}
          asOf={asOf}
          nextDueDate={nextDueDate}
          onClose={() => setPayingInvoice(null)}
          onPaid={handlePaid}
        />
      )}
    </main>
  );
}
