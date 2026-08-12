/**
 * Display formatters.
 *
 * Every formatter pins an explicit locale and (for dates) the UTC time zone so
 * that the markup rendered on the server matches the markup React produces on
 * the client. Relying on the ambient locale/time zone is the usual source of
 * hydration mismatches in this app.
 */

const LOCALE = "en-US";

const usdcFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdcWholeFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** `1273.94` → `$1,273.94` (or `$1,274` when `whole` is set). */
export function formatUsdc(value: number, whole = false): string {
  return whole ? usdcWholeFormatter.format(value) : usdcFormatter.format(value);
}

/** `105000` → `$105K`. Used for stat tiles where space is tight. */
export function formatCompactUsdc(value: number): string {
  return compactFormatter.format(value);
}

/** `"2026-08-15"` → `"Aug 15, 2026"`. */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** `"2026-08-15"` → `"Aug 2026"`. */
export function formatMonth(iso: string): string {
  return monthFormatter.format(new Date(iso));
}

/** Whole days between two ISO dates — negative when `to` is in the past. */
export function daysBetween(from: string, to: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = Date.parse(`${from.slice(0, 10)}T00:00:00Z`);
  const end = Date.parse(`${to.slice(0, 10)}T00:00:00Z`);
  return Math.round((end - start) / msPerDay);
}

/** `12` → `"in 12 days"`, `-3` → `"3 days ago"`, `0` → `"today"`. */
export function formatDayOffset(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
}

/** Shortens a Stellar address, CID or tx hash for display. */
export function truncateHash(value: string, lead = 6, tail = 6): string {
  if (value.length <= lead + tail + 1) return value;
  return `${value.slice(0, lead)}…${value.slice(-tail)}`;
}

/** Clamps an arbitrary number into the 0-100 range used by progress bars. */
export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}
