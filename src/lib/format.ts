/**
 * Units and display formatters.
 *
 * Amounts travel as integer strings in the settlement asset's smallest unit:
 * USDC has 7 decimals, so `"10000000"` is 1 USDC. They are kept as `bigint`
 * for arithmetic and only turned into text at the edge, so nothing is lost to
 * floating point.
 *
 * Every formatter pins an explicit locale and the UTC time zone so server and
 * client renders agree.
 */

export const USDC_DECIMALS = 7;
const SCALE = 10n ** BigInt(USDC_DECIMALS);
const LOCALE = "en-US";

export function toBig(value: string | number | bigint | null | undefined): bigint {
  if (value === null || value === undefined || value === "") return 0n;
  return typeof value === "bigint" ? value : BigInt(value);
}

/**
 * Parse a USDC amount typed by a person (`"1,250.50"`) into base units.
 * Returns `null` for anything that is not a non-negative amount with at most
 * seven decimal places.
 */
export function parseUsdc(input: string): bigint | null {
  const cleaned = input.replace(/[,\s$]/g, "");
  const match = /^(\d*)(?:\.(\d*))?$/.exec(cleaned);
  if (!match || (!match[1] && !match[2])) return null;
  const [, whole = "", fraction = ""] = match;
  if (fraction.length > USDC_DECIMALS) return null;
  return BigInt(whole || "0") * SCALE + BigInt(fraction.padEnd(USDC_DECIMALS, "0") || "0");
}

/** Base units → plain decimal text, e.g. for pre-filling an input. */
export function toUsdcString(units: bigint | string, maxDecimals = USDC_DECIMALS): string {
  const value = toBig(units);
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const whole = abs / SCALE;
  let fraction = (abs % SCALE).toString().padStart(USDC_DECIMALS, "0").slice(0, maxDecimals);
  fraction = fraction.replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

const grouping = new Intl.NumberFormat(LOCALE);

/**
 * Base units → `$1,250.50`. Shows cents by default, and more precision only
 * when a value is non-zero but smaller than a cent.
 */
export function formatUsdc(units: bigint | string | null | undefined, options: { whole?: boolean } = {}): string {
  const value = toBig(units);
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const decimals = options.whole ? 0 : abs > 0n && abs < SCALE / 100n ? USDC_DECIMALS : 2;
  // Round half up at the displayed precision.
  const step = 10n ** BigInt(USDC_DECIMALS - decimals);
  const rounded = ((abs + step / 2n) / step) * step;
  const whole = grouping.format(rounded / SCALE);
  const fraction = decimals ? "." + (rounded % SCALE).toString().padStart(USDC_DECIMALS, "0").slice(0, decimals) : "";
  return `${negative ? "−" : ""}$${whole}${fraction}`;
}

const compact = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Base units → `$105K`. For stat tiles where space is tight. */
export function formatCompactUsdc(units: bigint | string | null | undefined): string {
  return compact.format(Number(toBig(units) / (SCALE / 100n)) / 100);
}

/** `850` → `8.50%`. */
export function formatBps(bps: number | bigint | string): string {
  const value = Number(bps);
  return `${(value / 100).toFixed(2)}%`;
}

/** Share of `part` in `whole` as 0-100, safe for zero and bigint inputs. */
export function percentOf(part: bigint | string, whole: bigint | string): number {
  const w = toBig(whole);
  if (w <= 0n) return 0;
  return Number((toBig(part) * 10_000n) / w) / 100;
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

/** Ledger seconds → `Aug 15, 2026`. */
export function formatLedgerDate(seconds: bigint | string): string {
  return dateFormatter.format(new Date(Number(toBig(seconds)) * 1000));
}

/** Ledger seconds → `Aug 15, 2026, 09:30 AM UTC`. */
export function formatLedgerDateTime(seconds: bigint | string): string {
  return dateTimeFormatter.format(new Date(Number(toBig(seconds)) * 1000));
}

/** ISO string → `Aug 15, 2026, 09:30 AM UTC`. */
export function formatIsoDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

/** A span in seconds → `14 days`, `3 hours`. */
export function formatDuration(seconds: bigint | string | number): string {
  const s = Math.abs(Number(seconds));
  const units: [number, string][] = [
    [86_400, "day"],
    [3_600, "hour"],
    [60, "minute"],
  ];
  for (const [size, name] of units) {
    if (s >= size) {
      const n = Math.floor(s / size);
      return `${n} ${name}${n === 1 ? "" : "s"}`;
    }
  }
  return `${Math.floor(s)} seconds`;
}

/** `target - now` in seconds → `in 12 days` / `3 days ago`. */
export function formatRelative(target: bigint | string, now: bigint | string): string {
  const delta = Number(toBig(target) - toBig(now));
  if (Math.abs(delta) < 60) return "now";
  return delta > 0 ? `in ${formatDuration(delta)}` : `${formatDuration(delta)} ago`;
}

/** Shortens a Stellar address or digest for display. */
export function truncateHash(value: string, lead = 6, tail = 6): string {
  if (value.length <= lead + tail + 1) return value;
  return `${value.slice(0, lead)}…${value.slice(-tail)}`;
}

/** Clamps an arbitrary number into the 0-100 range used by progress bars. */
export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}
