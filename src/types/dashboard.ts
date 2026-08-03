/**
 * Domain types for the borrower dashboard.
 *
 * These mirror the shape of the data that will eventually be read from the
 * Soroban contracts (PropertyRegistry, MortgagePool, BuildEscrow) plus the
 * IPFS evidence pinned by the trustee. Until the RPC layer lands, the same
 * shapes are populated from `src/data/borrower.ts`.
 */

/** Lifecycle of a single build milestone inside the BuildEscrow contract. */
export type MilestoneStatus =
  | "released" // Tranche verified and USDC paid out to the contractor
  | "verifying" // Evidence submitted, awaiting oracle / inspector sign-off
  | "in_progress" // Construction underway, no evidence submitted yet
  | "pending" // Not started — blocked by the preceding milestone
  | "halted"; // Escrow paused by the trustee or a failed inspection

/** Status of a monthly mortgage invoice issued by the MortgagePool. */
export type InvoiceStatus = "paid" | "due" | "overdue" | "upcoming";

/** A single piece of construction proof pinned to IPFS by the trustee. */
export interface MilestoneEvidence {
  id: string;
  caption: string;
  /** Content identifier of the photo pinned to IPFS. */
  ipfsCid: string;
  /** ISO-8601 date the photo was captured on site. */
  capturedAt: string;
  /** Who uploaded the proof (trustee, contractor or independent inspector). */
  capturedBy: string;
  /** Stable hue (0-360) used to render the placeholder tile deterministically. */
  hue: number;
}

export interface Milestone {
  id: string;
  /** 1-based position in the build sequence. */
  index: number;
  title: string;
  description: string;
  /** Share of the total escrow released when this milestone is verified. */
  tranchePercent: number;
  /** USDC value of the tranche. */
  trancheAmount: number;
  status: MilestoneStatus;
  /** Physical completion of the milestone, 0-100. */
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  /** Independent inspector attached to the milestone, when assigned. */
  inspector: string | null;
  /** Stellar transaction that released the tranche, once paid out. */
  releaseTxHash: string | null;
  evidence: MilestoneEvidence[];
}

/** A monthly repayment invoice drawn from the amortization schedule. */
export interface Invoice {
  id: string;
  /** Human readable reference, e.g. `INV-0812-014`. */
  reference: string;
  /** 1-based period within the loan term. */
  period: number;
  /** ISO-8601 due date. */
  dueDate: string;
  /** Principal + interest owed for the period. */
  amountDue: number;
  principal: number;
  interest: number;
  /** Penalty accrued once an invoice passes its due date. */
  lateFee: number;
  /** Outstanding loan principal after this payment clears. */
  balanceAfter: number;
  status: InvoiceStatus;
  paidAt: string | null;
  paymentTxHash: string | null;
}

export interface BorrowerProfile {
  name: string;
  walletAddress: string;
  kycVerified: boolean;
  memberSince: string;
  /** Spendable USDC in the connected wallet, used to fund repayments. */
  usdcBalance: number;
}

export interface Property {
  /** Registry reference, e.g. `0812-NG`. */
  id: string;
  title: string;
  location: string;
  plotSize: string;
  trustee: string;
  contractor: string;
  /** Surveyor valuation in USDC, also the PROP collateral value. */
  valuation: number;
  /** IPFS CID of the verified title deed bundle. */
  titleCid: string;
  /** Land registry that confirmed ownership. */
  registry: string;
  verifiedAt: string;
}

export interface Mortgage {
  loanAmount: number;
  /** Loan-to-value ratio as a percentage. */
  ltv: number;
  /** Fixed annual interest rate as a decimal, e.g. `0.08`. */
  annualRate: number;
  termMonths: number;
  originatedAt: string;
  firstDueDate: string;
  /** PROP token value locked in the MortgagePool. */
  collateralLocked: number;
  poolContract: string;
}

export interface Escrow {
  contractId: string;
  /** Total USDC held by the BuildEscrow for this property. */
  totalFunded: number;
  /** USDC already paid out to contractors. */
  totalReleased: number;
  /** Expected handover date for the completed build. */
  targetCompletion: string;
}

/** Everything the dashboard needs for a single borrower account. */
export interface BorrowerDashboardData {
  /**
   * ISO-8601 date the snapshot was taken. Every "days until due" calculation
   * is measured against this rather than the wall clock, so the rendered
   * output stays stable and hydration-safe.
   */
  asOf: string;
  borrower: BorrowerProfile;
  property: Property;
  mortgage: Mortgage;
  escrow: Escrow;
  milestones: Milestone[];
  invoices: Invoice[];
}
