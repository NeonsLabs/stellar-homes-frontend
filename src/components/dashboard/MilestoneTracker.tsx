"use client";

import React, { useMemo, useState } from "react";
import MilestoneCard from "./MilestoneCard";
import { Badge } from "./StatusBadge";
import { formatUsdc } from "@/lib/format";
import type { Milestone, MilestoneStatus } from "@/types/dashboard";

type FilterKey = "all" | "active" | "released" | "upcoming";

const FILTERS: { key: FilterKey; label: string; matches: MilestoneStatus[] }[] = [
  { key: "all", label: "All", matches: [] },
  { key: "active", label: "Active", matches: ["in_progress", "verifying", "halted"] },
  { key: "released", label: "Released", matches: ["released"] },
  { key: "upcoming", label: "Upcoming", matches: ["pending"] },
];

const SEGMENT_CLASSES: Record<MilestoneStatus, string> = {
  released: "bg-emerald-500",
  verifying: "bg-amber-400",
  in_progress: "bg-sky-500",
  pending: "bg-slate-700",
  halted: "bg-rose-500",
};

/** Compact strip showing every tranche sized by its share of the escrow. */
function TrancheStrip({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`${SEGMENT_CLASSES[milestone.status]} rounded-full transition-colors`}
            // Grow proportionally rather than by width, so the inter-segment
            // gaps do not push the total past 100% and clip the last tranche.
            style={{ flexGrow: milestone.tranchePercent, flexBasis: 0 }}
            title={`${milestone.title} — ${milestone.tranchePercent}% (${formatUsdc(milestone.trancheAmount, true)})`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Released
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Awaiting verification
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" /> In progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-700" /> Not started
        </span>
      </div>
    </div>
  );
}

export interface MilestoneTrackerProps {
  milestones: Milestone[];
}

/**
 * The milestone tracker: a tranche overview strip, status filters, and one
 * card per build milestone.
 */
export default function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const byFilter = {} as Record<FilterKey, number>;
    for (const { key, matches } of FILTERS) {
      byFilter[key] =
        key === "all"
          ? milestones.length
          : milestones.filter((milestone) => matches.includes(milestone.status)).length;
    }
    return byFilter;
  }, [milestones]);

  /** The milestone the build is currently sitting on, opened by default. */
  const activeMilestoneId = useMemo(
    () =>
      milestones.find((milestone) => milestone.status !== "released")?.id ?? null,
    [milestones],
  );

  const visible = useMemo(() => {
    const matches = FILTERS.find((entry) => entry.key === filter)?.matches ?? [];
    return filter === "all"
      ? milestones
      : milestones.filter((milestone) => matches.includes(milestone.status));
  }, [filter, milestones]);

  return (
    <section id="milestones" className="scroll-mt-24 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
            BuildEscrow
          </span>
          <h2 className="text-2xl font-bold text-white">Construction milestones</h2>
          <p className="text-sm text-slate-400">
            Each tranche is released only after the trustee&apos;s photo evidence is
            verified on-chain.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter milestones by status"
          className="flex flex-wrap gap-1 rounded-2xl border border-white/5 bg-white/5 p-1"
        >
          {FILTERS.map((entry) => (
            <button
              key={entry.key}
              role="tab"
              type="button"
              aria-selected={filter === entry.key}
              onClick={() => setFilter(entry.key)}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                filter === entry.key
                  ? "bg-sky-500/15 text-sky-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {entry.label}
              <span className="ml-1.5 text-xs opacity-60">{counts[entry.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <TrancheStrip milestones={milestones} />
      </div>

      {visible.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <Badge tone="slate">Nothing here</Badge>
          <p className="mt-3 text-sm text-slate-400">
            No milestones currently match this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {visible.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              defaultExpanded={milestone.id === activeMilestoneId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
