/**
 * Demo data for the borrower dashboard.
 *
 * This module stands in for the Soroban RPC layer: swapping it for real
 * contract reads should only require replacing the exported
 * `getBorrowerDashboardData()` with an async fetch that returns the same
 * `BorrowerDashboardData` shape.
 *
 * Everything here is deterministic — no `Date.now()`, no randomness — so the
 * server and client renders agree and the page hydrates cleanly.
 *
 * The milestone `ipfsCid` values are real, publicly pinned sample CIDs rather
 * than trustee uploads, so the gateway resolver can be exercised end to end.
 * They deliberately cover CIDv1, CIDv0 and a directory-plus-filename path.
 */

import { buildAmortizationSchedule } from "@/lib/mortgage";
import type {
  BorrowerDashboardData,
  BorrowerProfile,
  Escrow,
  Invoice,
  Milestone,
  Mortgage,
  Property,
} from "@/types/dashboard";

/**
 * The date the demo snapshot was taken. Statuses below are expressed relative
 * to this instant rather than to the wall clock, which keeps the dashboard
 * stable and hydration-safe.
 */
export const AS_OF_DATE = "2026-08-03";

/** Instalments 1-12 have cleared; 13 slipped past its due date. */
const PERIODS_PAID = 12;
const OVERDUE_PERIOD = 13;
const CURRENT_PERIOD = 14;

/** Penalty applied to an instalment once it passes its due date (0.5%). */
const LATE_FEE_RATE = 0.005;

const borrower: BorrowerProfile = {
  name: "Adaeze Okonkwo",
  walletAddress: "GB7R7U3AN4V6TPAZ7X3O5FHEPA4X3KJH24B5XWEXM6X3OZQ7LKMD2FA",
  kycVerified: true,
  memberSince: "2025-04-02",
  usdcBalance: 4_820.55,
};

const property: Property = {
  id: "0812-NG",
  title: "3-Bedroom Detached Bungalow",
  location: "Lekki Phase 2, Lagos, Nigeria",
  plotSize: "450 sqm",
  trustee: "Adeyemi & Sons Trustees Ltd.",
  contractor: "BuildRight Construction Co.",
  valuation: 175_000,
  titleCid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  registry: "MLHUD Lagos State",
  verifiedAt: "2025-05-28",
};

const mortgage: Mortgage = {
  loanAmount: 105_000,
  ltv: 60,
  annualRate: 0.08,
  termMonths: 120,
  originatedAt: "2025-06-15",
  firstDueDate: "2025-07-15",
  collateralLocked: 175_000,
  poolContract: "CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K",
};

const milestones: Milestone[] = [
  {
    id: "ms-01",
    index: 1,
    title: "Foundation & Site Preparation",
    description:
      "Site clearing, excavation, blinding and reinforced concrete raft foundation cast to the approved structural drawings.",
    tranchePercent: 20,
    trancheAmount: 21_000,
    status: "released",
    progress: 100,
    startedAt: "2025-06-20",
    completedAt: "2025-08-12",
    inspector: "Eng. Chidi Nwosu (COREN #38214)",
    releaseTxHash:
      "a4f21c9de07b5583c1f0aa9d3e6b47182c5d09fe4b7a1c8e2d6039fb5a71c4e8",
    evidence: [
      {
        id: "ev-01-a",
        caption: "Excavation and setting out complete",
        ipfsCid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        capturedAt: "2025-07-04",
        capturedBy: "Adeyemi & Sons Trustees Ltd.",
        hue: 28,
      },
      {
        id: "ev-01-b",
        caption: "Reinforcement mesh laid before pour",
        ipfsCid: "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
        capturedAt: "2025-07-26",
        capturedBy: "BuildRight Construction Co.",
        hue: 40,
      },
      {
        id: "ev-01-c",
        caption: "Raft foundation cured and inspected",
        ipfsCid: "bafkreie7ohywtosou76tasm7j63yigtzxe7d5zqus4zu3j6oltvgtibeom",
        capturedAt: "2025-08-10",
        capturedBy: "Eng. Chidi Nwosu",
        hue: 20,
      },
    ],
  },
  {
    id: "ms-02",
    index: 2,
    title: "Structural Walls & Columns",
    description:
      "Blockwork to lintel level, reinforced concrete columns and ring beam cast across the full floor plate.",
    tranchePercent: 25,
    trancheAmount: 26_250,
    status: "released",
    progress: 100,
    startedAt: "2025-08-18",
    completedAt: "2026-01-22",
    inspector: "Eng. Chidi Nwosu (COREN #38214)",
    releaseTxHash:
      "7b39e2ac41d0f85629cb7d13a04ef5b8c26719da3f80b4e5c9127ad6e3f0b8c1",
    evidence: [
      {
        id: "ev-02-a",
        caption: "Blockwork risen to window level",
        ipfsCid: "bafybeibml5uieyxa5tufngvg7fgwbkwvlsuntwbxgtskoqynbt7wlchmfm",
        capturedAt: "2025-10-09",
        capturedBy: "Adeyemi & Sons Trustees Ltd.",
        hue: 205,
      },
      {
        id: "ev-02-b",
        caption: "Columns cast and ring beam formwork set",
        ipfsCid: "ipfs://bafybeicn7i3soqdgr7dwnrwytgq4zxy7a5jpkizrvhm5mv6bgjd32wm3q4/welcome-to-IPFS.jpg",
        capturedAt: "2025-12-14",
        capturedBy: "BuildRight Construction Co.",
        hue: 190,
      },
      {
        id: "ev-02-c",
        caption: "Ring beam poured, walls signed off",
        ipfsCid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        capturedAt: "2026-01-19",
        capturedBy: "Eng. Chidi Nwosu",
        hue: 168,
      },
    ],
  },
  {
    id: "ms-03",
    index: 3,
    title: "Roofing & Weatherproofing",
    description:
      "Timber trusses, stone-coated roof sheets, fascia and gutters installed; the structure is now fully weathertight.",
    tranchePercent: 20,
    trancheAmount: 21_000,
    status: "verifying",
    progress: 100,
    startedAt: "2026-02-02",
    completedAt: "2026-07-24",
    inspector: "Eng. Funmi Balogun (COREN #41907)",
    releaseTxHash: null,
    evidence: [
      {
        id: "ev-03-a",
        caption: "Roof trusses erected and braced",
        ipfsCid: "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
        capturedAt: "2026-05-11",
        capturedBy: "BuildRight Construction Co.",
        hue: 268,
      },
      {
        id: "ev-03-b",
        caption: "Stone-coated sheets fixed, gutters in place",
        ipfsCid: "bafybeibml5uieyxa5tufngvg7fgwbkwvlsuntwbxgtskoqynbt7wlchmfm",
        capturedAt: "2026-07-22",
        capturedBy: "Adeyemi & Sons Trustees Ltd.",
        hue: 288,
      },
    ],
  },
  {
    id: "ms-04",
    index: 4,
    title: "Windows, Doors & Plumbing First Fix",
    description:
      "Aluminium window frames, external doors and the concealed plumbing runs for the kitchen and three bathrooms.",
    tranchePercent: 15,
    trancheAmount: 15_750,
    status: "in_progress",
    progress: 35,
    startedAt: "2026-07-06",
    completedAt: null,
    inspector: null,
    releaseTxHash: null,
    evidence: [
      {
        id: "ev-04-a",
        caption: "Window openings prepared for frames",
        ipfsCid: "bafkreie7ohywtosou76tasm7j63yigtzxe7d5zqus4zu3j6oltvgtibeom",
        capturedAt: "2026-07-29",
        capturedBy: "BuildRight Construction Co.",
        hue: 145,
      },
    ],
  },
  {
    id: "ms-05",
    index: 5,
    title: "Electrical & Plastering",
    description:
      "Conduit and cabling to the approved electrical layout, distribution board installation, then internal and external plastering.",
    tranchePercent: 12,
    trancheAmount: 12_600,
    status: "pending",
    progress: 0,
    startedAt: null,
    completedAt: null,
    inspector: null,
    releaseTxHash: null,
    evidence: [],
  },
  {
    id: "ms-06",
    index: 6,
    title: "Finishing & Handover",
    description:
      "Tiling, painting, fittings, second-fix electrical and plumbing, snagging, and the final handover inspection.",
    tranchePercent: 8,
    trancheAmount: 8_400,
    status: "pending",
    progress: 0,
    startedAt: null,
    completedAt: null,
    inspector: null,
    releaseTxHash: null,
    evidence: [],
  },
];

const escrow: Escrow = {
  contractId: "CAWY2XQ4LP7BMHVN3JZKDR6TSGE5FUC2XOQ7WMDV4NZR3PLK5TIAQBHE",
  totalFunded: mortgage.loanAmount,
  totalReleased: milestones
    .filter((milestone) => milestone.status === "released")
    .reduce((sum, milestone) => sum + milestone.trancheAmount, 0),
  targetCompletion: "2027-02-28",
};

/** Settlement hashes for instalments that have already cleared on-chain. */
const SETTLED_TX_HASHES = [
  "3f7a1c94be20d85176ec4ba9032df581c7e6094ab2531fd78c0e4a6b19d5f3c2",
  "c18b4d0e75a3f92641db7c5e08a2f9346bd15e7c920af483d61b0e5a2c7f9d34",
  "9d24e6b0af17c5382e04db96f1a7c53b8e206d4af59c1b73e082a6d4c31f5b90",
  "5a80f3c2d961b47e08c25a3df709b1642e8d0c73a95f2b681d40e7c39a2b6f15",
  "b19f4a72d0c85e361bd2a9407fc53e8016b7d4a29ce50f83b1d64a70e5c29fb3",
  "71bd5e0a93c26f48d0175ab3e92c4f608d3b752e1c084f9b3d726ac508f1e4b3",
];

/**
 * Turns the amortization schedule into borrower-facing invoices, stamping the
 * fixed demo statuses onto each period.
 */
function buildInvoices(): Invoice[] {
  const schedule = buildAmortizationSchedule({
    principal: mortgage.loanAmount,
    annualRate: mortgage.annualRate,
    termMonths: mortgage.termMonths,
    firstDueDate: mortgage.firstDueDate,
  });

  return schedule.map((row) => {
    const isPaid = row.period <= PERIODS_PAID;
    const isOverdue = row.period === OVERDUE_PERIOD;
    const isCurrent = row.period === CURRENT_PERIOD;

    const status: Invoice["status"] = isPaid
      ? "paid"
      : isOverdue
        ? "overdue"
        : isCurrent
          ? "due"
          : "upcoming";

    return {
      id: `inv-${String(row.period).padStart(3, "0")}`,
      reference: `INV-${property.id}-${String(row.period).padStart(3, "0")}`,
      period: row.period,
      dueDate: row.dueDate,
      amountDue: row.payment,
      principal: row.principal,
      interest: row.interest,
      lateFee: isOverdue ? Math.round(row.payment * LATE_FEE_RATE * 100) / 100 : 0,
      balanceAfter: row.balanceAfter,
      status,
      paidAt: isPaid ? row.dueDate : null,
      paymentTxHash: isPaid
        ? SETTLED_TX_HASHES[(row.period - 1) % SETTLED_TX_HASHES.length]
        : null,
    };
  });
}

const invoices = buildInvoices();

/**
 * Returns the dashboard snapshot for the signed-in borrower.
 *
 * Kept as a function (rather than a bare export) so the call site does not
 * change when this is swapped for a Soroban RPC read.
 */
export function getBorrowerDashboardData(): BorrowerDashboardData {
  return {
    asOf: AS_OF_DATE,
    borrower,
    property,
    mortgage,
    escrow,
    milestones,
    invoices,
  };
}
