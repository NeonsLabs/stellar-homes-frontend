import React from "react";
import type { MilestoneStatus } from "@/types/dashboard";

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
}

/** Small pill used for statuses and inline metadata across the dashboard. */
export function Badge({
  tone = "slate",
  dot = false,
  pulse = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONE_CLASSES[tone]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? "animate-pulse" : ""}`}
        />
      )}
      {children}
    </span>
  );
}

interface MilestoneStatusMeta {
  label: string;
  tone: BadgeTone;
  /** Short explanation of what the contract is waiting on. */
  hint: string;
  pulse: boolean;
}

export const MILESTONE_STATUS_META: Record<MilestoneStatus, MilestoneStatusMeta> = {
  released: {
    label: "Tranche released",
    tone: "emerald",
    hint: "Milestone verified on-chain and USDC paid out to the contractor.",
    pulse: false,
  },
  verifying: {
    label: "Awaiting verification",
    tone: "amber",
    hint: "Evidence submitted to the oracle — the tranche unlocks once the inspector signs off.",
    pulse: true,
  },
  in_progress: {
    label: "In progress",
    tone: "sky",
    hint: "Construction underway. The tranche stays locked in BuildEscrow until proof is submitted.",
    pulse: true,
  },
  pending: {
    label: "Not started",
    tone: "slate",
    hint: "Blocked until the preceding milestone is verified and released.",
    pulse: false,
  },
  halted: {
    label: "Halted",
    tone: "rose",
    hint: "Escrow paused by the trustee. Contact your trustee to resolve the dispute.",
    pulse: false,
  },
};

/** Status pill for a build milestone. */
export default function StatusBadge({ status }: { status: MilestoneStatus }) {
  const meta = MILESTONE_STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot pulse={meta.pulse}>
      {meta.label}
    </Badge>
  );
}
