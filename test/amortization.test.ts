import { describe, expect, it } from "vitest";
import { MAX_RATE_BPS, maxPrincipal, projectFullyDrawn } from "../src/lib/amortization";

const USDC = 10_000_000n;

describe("projectFullyDrawn", () => {
  it("with no interest repays principal in equal slices", () => {
    const p = projectFullyDrawn(120n * USDC, 12, 0);
    expect(p.instalments).toHaveLength(12);
    expect(p.totalInterest).toBe(0n);
    expect(p.totalPaid).toBe(120n * USDC);
    expect(p.instalments.every((i) => i.payment === 10n * USDC)).toBe(true);
  });

  it("charges constant amortisation, so payments fall as the balance does", () => {
    const p = projectFullyDrawn(120n * USDC, 12, 850);
    expect(p.firstPayment).toBeGreaterThan(p.lastPayment);
    for (let i = 1; i < p.instalments.length; i++) {
      expect(p.instalments[i].payment).toBeLessThanOrEqual(p.instalments[i - 1].payment);
    }
  });

  it("pays off exactly: principal parts sum to the loan and the balance ends at zero", () => {
    const principal = 123_456_789n;
    const p = projectFullyDrawn(principal, 7, 850);
    const principalPaid = p.instalments.reduce((sum, i) => sum + i.principal, 0n);
    expect(principalPaid).toBe(principal);
    expect(p.instalments.at(-1)?.balanceAfter).toBe(0n);
    expect(p.totalPaid).toBe(principal + p.totalInterest);
  });

  it("takes the first month's interest from the whole balance", () => {
    // 100 USDC at 12% a year is 1% a month: 1 USDC of interest in month one.
    const p = projectFullyDrawn(100n * USDC, 10, 1200);
    expect(p.instalments[0].interest).toBe(1n * USDC);
    expect(p.instalments[0].principal).toBe(10n * USDC);
    expect(p.firstPayment).toBe(11n * USDC);
  });

  it("handles the longest term without overflowing", () => {
    // 30 years on a large loan; bigint arithmetic has no overflow to hit.
    const principal = 5_000_000n * USDC;
    const p = projectFullyDrawn(principal, 360, MAX_RATE_BPS);
    expect(p.instalments).toHaveLength(360);
    expect(p.instalments.at(-1)?.balanceAfter).toBe(0n);
    expect(p.totalPaid).toBe(principal + p.totalInterest);
  });

  it("returns an empty projection for nothing to project", () => {
    expect(projectFullyDrawn(0n, 12, 850).instalments).toHaveLength(0);
    expect(projectFullyDrawn(100n * USDC, 0, 850).instalments).toHaveLength(0);
  });
});

describe("maxPrincipal", () => {
  it("allows 80% of the valuation", () => {
    expect(maxPrincipal(200n * USDC)).toBe(160n * USDC);
  });

  it("rounds down so the limit is never exceeded", () => {
    expect(maxPrincipal(3n)).toBe(2n);
    expect(maxPrincipal(0n)).toBe(0n);
  });
});
