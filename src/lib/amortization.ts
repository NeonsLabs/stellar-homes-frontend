/**
 * The MortgagePool's arithmetic, for projecting a loan that does not exist yet.
 *
 * The contract charges **constant amortisation**, not a level-payment annuity:
 * each monthly instalment is the month's interest on the drawn balance plus
 * `principal / termMonths`, so payments fall as the balance does. Interest is
 * integer division with the remainder carried to the next month.
 *
 * This mirrors `accrue`, `instalmentDue` and `applyPayment` in the contract
 * (and the backend's port of them) for a facility drawn in full on day one.
 * For a real loan use `GET /api/mortgages/:id/schedule`, which works from the
 * loan's actual state. Either way the chain is the source of truth.
 */

export const BPS_DENOMINATOR = 10_000n;
export const MONTHS_PER_YEAR = 12n;
/** 80% loan-to-value, fixed in the contract. */
export const MAX_LTV_BPS = 8_000n;
/** 30% annual rate cap, fixed in the contract. */
export const MAX_RATE_BPS = 3_000;
/** The backend's default rate. */
export const DEFAULT_RATE_BPS = 850;
export const STAGE_NAMES = ["Foundation", "Walls", "Roofing", "Finishing", "Handover"] as const;
export const MILESTONE_COUNT = STAGE_NAMES.length;

export interface ProjectedInstalment {
  number: number;
  payment: bigint;
  interest: bigint;
  principal: bigint;
  balanceAfter: bigint;
}

export interface Projection {
  instalments: ProjectedInstalment[];
  firstPayment: bigint;
  lastPayment: bigint;
  totalInterest: bigint;
  totalPaid: bigint;
}

export function projectFullyDrawn(principal: bigint, termMonths: number, rateBps: number): Projection {
  const instalments: ProjectedInstalment[] = [];
  if (principal <= 0n || termMonths <= 0) {
    return { instalments, firstPayment: 0n, lastPayment: 0n, totalInterest: 0n, totalPaid: 0n };
  }
  const divisor = BPS_DENOMINATOR * MONTHS_PER_YEAR;
  const slice = principal / BigInt(termMonths);
  let outstanding = principal;
  let carry = 0n;
  let totalInterest = 0n;
  let totalPaid = 0n;

  // A facility smaller than its term in base units amortises nothing per
  // month, so the loop is bounded, as it is in the backend.
  const maxRows = termMonths + 12;
  while (outstanding > 0n && instalments.length < maxRows) {
    const numerator = outstanding * BigInt(rateBps) + carry;
    const interest = numerator / divisor;
    carry = numerator % divisor;
    const principalPart = slice > outstanding ? outstanding : slice;
    // The final instalment clears whatever is left, as a payoff would.
    const isLast = instalments.length === termMonths - 1;
    const principalPaid = isLast ? outstanding : principalPart;
    if (principalPaid === 0n && interest === 0n) break;
    outstanding -= principalPaid;
    totalInterest += interest;
    totalPaid += interest + principalPaid;
    instalments.push({
      number: instalments.length + 1,
      payment: interest + principalPaid,
      interest,
      principal: principalPaid,
      balanceAfter: outstanding,
    });
  }

  return {
    instalments,
    firstPayment: instalments[0]?.payment ?? 0n,
    lastPayment: instalments[instalments.length - 1]?.payment ?? 0n,
    totalInterest,
    totalPaid,
  };
}

/** Largest principal the contract accepts against a valuation. */
export function maxPrincipal(valuation: bigint): bigint {
  return (valuation * MAX_LTV_BPS) / BPS_DENOMINATOR;
}

/** An equal share of the facility per stage; the last stage takes the remainder. */
export function trancheFor(principal: bigint, stage: number): bigint {
  const count = BigInt(MILESTONE_COUNT);
  const each = principal / count;
  return stage === MILESTONE_COUNT - 1 ? principal - each * (count - 1n) : each;
}
