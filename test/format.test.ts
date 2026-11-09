import { describe, expect, it } from "vitest";
import { formatBps, formatUsdc, parseUsdc, percentOf, toUsdcString } from "../src/lib/format";

// Amounts are integers in USDC's smallest unit (7 decimals): 1 USDC = 10_000_000.
describe("parseUsdc", () => {
  it("reads a typed amount into base units", () => {
    expect(parseUsdc("1,250.50")).toBe(12_505_000_000n);
    expect(parseUsdc("$10")).toBe(100_000_000n);
    expect(parseUsdc(".5")).toBe(5_000_000n);
  });

  it("accepts exactly seven decimal places and rejects an eighth", () => {
    expect(parseUsdc("0.0000001")).toBe(1n);
    expect(parseUsdc("0.00000001")).toBeNull();
  });

  it("rejects text, negatives and empty input", () => {
    expect(parseUsdc("abc")).toBeNull();
    expect(parseUsdc("-5")).toBeNull();
    expect(parseUsdc("")).toBeNull();
    expect(parseUsdc("1.2.3")).toBeNull();
  });
});

describe("toUsdcString", () => {
  it("turns base units back into plain decimal text", () => {
    expect(toUsdcString(12_505_000_000n)).toBe("1250.5");
    expect(toUsdcString("100000000")).toBe("10");
    expect(toUsdcString(1n)).toBe("0.0000001");
  });

  it("round-trips with parseUsdc without losing a unit", () => {
    for (const units of [0n, 1n, 9_999_999n, 123_456_789n, 10n ** 15n + 7n]) {
      expect(parseUsdc(toUsdcString(units))).toBe(units);
    }
  });
});

describe("formatUsdc", () => {
  it("shows dollars and cents with grouping", () => {
    expect(formatUsdc(12_505_000_000n)).toBe("$1,250.50");
    expect(formatUsdc(0n)).toBe("$0.00");
    expect(formatUsdc("200000000")).toBe("$20.00");
  });

  it("rounds half up at the displayed precision", () => {
    expect(formatUsdc(5_000n)).toBe("$0.0005000"); // below a cent, so more precision
    expect(formatUsdc(100_050_000n)).toBe("$10.01"); // 10.005 rounds up
  });

  it("marks negatives and can drop the cents", () => {
    expect(formatUsdc(-5_000_000n)).toBe("−$0.50");
    expect(formatUsdc(12_505_000_000n, { whole: true })).toBe("$1,251");
  });

  it("treats a missing value as zero", () => {
    expect(formatUsdc(null)).toBe("$0.00");
    expect(formatUsdc(undefined)).toBe("$0.00");
  });

  it("stays exact beyond the range where a float would round", () => {
    // 2^53 + 1 is the first integer a double cannot hold. As base units this is
    // 9,007,199,254.7409930 USDC, and every digit of the whole part must survive.
    expect(formatUsdc(90_071_992_547_409_930n)).toBe("$9,007,199,254.74");
    expect(toUsdcString(90_071_992_547_409_931n)).toBe("9007199254.7409931");
  });
});

describe("formatBps and percentOf", () => {
  it("formats basis points as a percentage", () => {
    expect(formatBps(850)).toBe("8.50%");
    expect(formatBps(0)).toBe("0.00%");
    expect(formatBps(3000n)).toBe("30.00%");
  });

  it("computes a share without dividing by zero", () => {
    expect(percentOf(1n, 3n)).toBe(33.33);
    expect(percentOf(5n, 0n)).toBe(0);
    expect(percentOf("200", "200")).toBe(100);
  });
});
