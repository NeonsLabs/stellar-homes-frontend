/**
 * Repayment submission layer.
 *
 * This is the single seam between the dashboard UI and the chain. Today it
 * simulates the two round trips a real repayment makes — a wallet signature
 * followed by network settlement — so the modal can exercise every state it
 * will need. Replacing it with a live `MortgagePool.repay()` invocation should
 * not require touching the components.
 */

import type { Invoice } from "@/types/dashboard";

/** Stages a repayment moves through, in order. */
export type RepaymentStage =
  | "review" // Borrower is checking the breakdown
  | "signing" // Waiting on the wallet signature
  | "submitting" // Transaction broadcast, awaiting settlement
  | "success"
  | "error";

export interface RepaymentReceipt {
  txHash: string;
  /** ISO-8601 date the payment settled. */
  settledAt: string;
  amount: number;
}

export interface RepaymentRequest {
  invoice: Invoice;
  /** Total debited, including any late fee. */
  amount: number;
  /** Spendable USDC in the borrower's wallet. */
  walletBalance: number;
  /** Date to stamp on the receipt. */
  settlementDate: string;
}

/** Raised when the repayment cannot be submitted, surfaced in the modal. */
export class RepaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepaymentError";
  }
}

/** Total debited for an invoice: principal + interest + any late fee. */
export function invoiceTotal(invoice: Invoice): number {
  return Math.round((invoice.amountDue + invoice.lateFee) * 100) / 100;
}

/**
 * Deterministic stand-in for a Stellar transaction hash.
 *
 * Derived from the invoice reference via FNV-1a so the same repayment always
 * produces the same hash — no `Math.random()`, which keeps the demo
 * reproducible and avoids any render-time nondeterminism.
 */
export function createMockTxHash(seed: string): string {
  let hash = 0x811c9dc5;
  const chunks: string[] = [];

  for (let round = 0; round < 8; round += 1) {
    const input = `${seed}:${round}`;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    chunks.push(hash.toString(16).padStart(8, "0"));
  }

  return chunks.join("");
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulates the wallet prompt the borrower has to approve. */
export async function requestSignature(): Promise<void> {
  await wait(1400);
}

/**
 * Simulates broadcasting the repayment and waiting for settlement.
 *
 * Rejects when the wallet cannot cover the invoice — the same guard the
 * contract call would hit — so the modal's error path is real behaviour
 * rather than unreachable code.
 */
export async function submitRepayment({
  invoice,
  amount,
  walletBalance,
  settlementDate,
}: RepaymentRequest): Promise<RepaymentReceipt> {
  await wait(1600);

  if (amount > walletBalance) {
    throw new RepaymentError(
      "Your wallet does not hold enough USDC to cover this invoice. Top up and try again.",
    );
  }

  return {
    txHash: createMockTxHash(invoice.reference),
    settledAt: settlementDate,
    amount,
  };
}
