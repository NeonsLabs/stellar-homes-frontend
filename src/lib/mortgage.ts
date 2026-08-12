/**
 * Amortization maths shared by the mortgage calculator and the borrower
 * dashboard's payment schedule.
 *
 * All helpers are pure and date-deterministic (no `Date.now()`), so the
 * schedule rendered on the server is byte-identical to the client render.
 */

export interface AmortizationRow {
  /** 1-based period within the loan term. */
  period: number;
  /** ISO-8601 (`YYYY-MM-DD`) due date for the period. */
  dueDate: string;
  /** Level monthly payment: principal + interest. */
  payment: number;
  principal: number;
  interest: number;
  /** Outstanding principal once the payment clears. */
  balanceAfter: number;
}

export interface ScheduleOptions {
  principal: number;
  /** Fixed annual rate as a decimal, e.g. `0.08` for 8% APR. */
  annualRate: number;
  termMonths: number;
  /** ISO-8601 date of the first instalment. */
  firstDueDate: string;
}

/** Rounds to whole cents so repeated arithmetic cannot drift. */
function toCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Standard level-payment (annuity) formula:
 * `P * r(1 + r)^n / ((1 + r)^n - 1)`.
 */
export function monthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
): number {
  if (termMonths <= 0) return 0;
  const rate = annualRate / 12;
  if (rate === 0) return toCents(principal / termMonths);

  const growth = Math.pow(1 + rate, termMonths);
  return toCents((principal * rate * growth) / (growth - 1));
}

/**
 * Adds `months` to an ISO date, keeping the day-of-month where possible and
 * clamping to the last day of shorter months (31 Jan + 1 month → 28 Feb).
 * Works entirely in UTC to stay time-zone independent.
 */
export function addMonths(iso: string, months: number): string {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  const day = date.getUTCDate();
  const shifted = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
  const daysInMonth = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0),
  ).getUTCDate();

  shifted.setUTCDate(Math.min(day, daysInMonth));
  return shifted.toISOString().slice(0, 10);
}

/**
 * Builds the full repayment schedule. The final period absorbs any rounding
 * remainder so the closing balance lands exactly on zero.
 */
export function buildAmortizationSchedule({
  principal,
  annualRate,
  termMonths,
  firstDueDate,
}: ScheduleOptions): AmortizationRow[] {
  const payment = monthlyPayment(principal, annualRate, termMonths);
  const rate = annualRate / 12;
  const rows: AmortizationRow[] = [];

  let balance = principal;

  for (let period = 1; period <= termMonths; period += 1) {
    const interest = toCents(balance * rate);
    const isFinal = period === termMonths;
    // The last instalment clears whatever principal is left over.
    const principalPart = isFinal ? balance : toCents(payment - interest);
    const total = isFinal ? toCents(principalPart + interest) : payment;

    balance = toCents(balance - principalPart);

    rows.push({
      period,
      dueDate: addMonths(firstDueDate, period - 1),
      payment: total,
      principal: principalPart,
      interest,
      balanceAfter: Math.max(0, balance),
    });
  }

  return rows;
}

/** Total interest paid across the life of the loan. */
export function totalInterest(rows: AmortizationRow[]): number {
  return toCents(rows.reduce((sum, row) => sum + row.interest, 0));
}
