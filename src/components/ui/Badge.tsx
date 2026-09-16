import React from "react";
import type { MortgageStatus, PropertyStatus } from "@/lib/api";

export type BadgeTone = "sky" | "emerald" | "amber" | "rose" | "slate" | "violet";

const TONE_CLASSES: Record<BadgeTone, string> = {
  sky: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  slate: "bg-white/5 text-slate-400 border-white/10",
  violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
};

export interface BadgeProps {
  tone?: BadgeTone;
  /** Renders a small leading dot, pulsing for live states. */
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

/** Small pill used for statuses and inline metadata. */
export function Badge({ tone = "slate", dot = false, pulse = false, children, className = "", title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONE_CLASSES[tone]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? "animate-pulse" : ""}`} />}
      {children}
    </span>
  );
}

const PROPERTY_META: Record<PropertyStatus, { tone: BadgeTone; label: string; hint: string }> = {
  Pending: { tone: "amber", label: "Title pending", hint: "Waiting for an oracle to verify the title." },
  Verified: { tone: "sky", label: "Title verified", hint: "Title is clean. A valuation makes it lendable." },
  Mortgaged: { tone: "violet", label: "Mortgaged", hint: "A mortgage has drawn its first tranche." },
  Repaid: { tone: "emerald", label: "Repaid", hint: "The mortgage against it was paid off." },
  Defaulted: { tone: "rose", label: "Defaulted", hint: "The mortgage against it was written off." },
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const meta = PROPERTY_META[status];
  return (
    <Badge tone={meta.tone} dot title={meta.hint}>
      {meta.label}
    </Badge>
  );
}

export const MORTGAGE_META: Record<MortgageStatus, { tone: BadgeTone; label: string; hint: string; live: boolean }> = {
  Applied: {
    tone: "amber",
    label: "Applied",
    hint: "Waiting for an underwriter. Nothing is committed yet.",
    live: true,
  },
  Approved: {
    tone: "sky",
    label: "Approved",
    hint: "The whole facility is committed against the pool. Tranches release as stages are signed off.",
    live: true,
  },
  Funded: {
    tone: "violet",
    label: "Funded",
    hint: "At least one tranche has been drawn. Interest accrues monthly on the drawn balance.",
    live: true,
  },
  Repaying: {
    tone: "violet",
    label: "Repaying",
    hint: "Repayments have started. No further tranches can be drawn.",
    live: true,
  },
  PaidOff: { tone: "emerald", label: "Paid off", hint: "Cleared in full.", live: false },
  Defaulted: {
    tone: "rose",
    label: "Defaulted",
    hint: "Written off after an instalment went unpaid past the grace period.",
    live: false,
  },
};

export function MortgageStatusBadge({ status }: { status: MortgageStatus }) {
  const meta = MORTGAGE_META[status];
  return (
    <Badge tone={meta.tone} dot pulse={meta.live} title={meta.hint}>
      {meta.label}
    </Badge>
  );
}
