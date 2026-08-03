/**
 * Pure selectors that derive the borrower's headline figures from the raw
 * dashboard data. Keeping them out of the components means the same numbers
 * stay consistent between the stat tiles, the milestone tracker and the
 * payment schedule — and they keep working once invoices become client state.
 */

import type { Escrow, Invoice, Milestone, Mortgage } from "@/types/dashboard";

/** Physical build completion, weighting each milestone by its tranche share. */
export function getBuildProgress(milestones: Milestone[]): number {
  const totalWeight = milestones.reduce(
    (sum, milestone) => sum + milestone.tranchePercent,
    0,
  );
  if (totalWeight === 0) return 0;

  const completed = milestones.reduce(
    (sum, milestone) => sum + (milestone.tranchePercent * milestone.progress) / 100,
    0,
  );
  return (completed / totalWeight) * 100;
}

/** Share of the escrow already paid out to contractors, 0-100. */
export function getEscrowProgress(escrow: Escrow): number {
  if (escrow.totalFunded === 0) return 0;
  return (escrow.totalReleased / escrow.totalFunded) * 100;
}

/** USDC still held by the BuildEscrow contract. */
export function getEscrowRemaining(escrow: Escrow): number {
  return Math.max(0, escrow.totalFunded - escrow.totalReleased);
}

export interface LoanPosition {
  /** Principal still owed to the MortgagePool. */
  outstandingPrincipal: number;
  /** Principal + interest paid so far. */
  totalPaid: number;
  interestPaid: number;
  principalPaid: number;
  paidCount: number;
  remainingCount: number;
  /** Share of the term already settled, 0-100. */
  repaymentProgress: number;
  /** Invoices past their due date and still unsettled. */
  overdueInvoices: Invoice[];
  /** Total owed right now, including any late fees. */
  amountOwedNow: number;
  /** The invoice the borrower should settle next, if any. */
  nextInvoice: Invoice | null;
}

/**
 * Rolls the invoice list up into the borrower's current loan position.
 *
 * Overdue invoices are settled first, so `nextInvoice` prefers the oldest
 * overdue instalment before the one that is merely due.
 */
export function getLoanPosition(
  invoices: Invoice[],
  mortgage: Mortgage,
): LoanPosition {
  const paid = invoices.filter((invoice) => invoice.status === "paid");
  const unpaid = invoices.filter((invoice) => invoice.status !== "paid");
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue");

  const principalPaid = paid.reduce((sum, invoice) => sum + invoice.principal, 0);
  const interestPaid = paid.reduce((sum, invoice) => sum + invoice.interest, 0);
  const feesPaid = paid.reduce((sum, invoice) => sum + invoice.lateFee, 0);

  const nextInvoice =
    overdueInvoices[0] ??
    unpaid.find((invoice) => invoice.status === "due") ??
    unpaid[0] ??
    null;

  const amountOwedNow = invoices
    .filter((invoice) => invoice.status === "overdue" || invoice.status === "due")
    .reduce((sum, invoice) => sum + invoice.amountDue + invoice.lateFee, 0);

  return {
    outstandingPrincipal: Math.max(
      0,
      round(mortgage.loanAmount - principalPaid),
    ),
    totalPaid: round(principalPaid + interestPaid + feesPaid),
    interestPaid: round(interestPaid),
    principalPaid: round(principalPaid),
    paidCount: paid.length,
    remainingCount: unpaid.length,
    repaymentProgress: invoices.length === 0 ? 0 : (paid.length / invoices.length) * 100,
    overdueInvoices,
    amountOwedNow: round(amountOwedNow),
    nextInvoice,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
