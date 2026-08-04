"use client";

import React, { useState } from "react";
import EvidenceGallery from "./EvidenceGallery";
import ProgressBar from "./ProgressBar";
import StatusBadge, { MILESTONE_STATUS_META } from "./StatusBadge";
import { formatDate, formatUsdc, truncateHash } from "@/lib/format";
import type { Milestone } from "@/types/dashboard";

const EXPLORER_TX_URL = "https://stellar.expert/explorer/testnet/tx";

const INDEX_CLASSES: Record<string, string> = {
  released: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  verifying: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  in_progress: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  pending: "bg-white/5 text-slate-500 border-white/10",
  halted: "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

const PROGRESS_TONE = {
  released: "emerald",
  verifying: "amber",
  in_progress: "sky",
  pending: "slate",
  halted: "amber",
} as const;

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 text-right font-medium text-slate-200">{children}</span>
    </div>
  );
}

export interface MilestoneCardProps {
  milestone: Milestone;
  /** Expanded on first render — used to open the milestone currently building. */
  defaultExpanded?: boolean;
}

/**
 * One build milestone: its tranche value, physical progress, submitted photo
 * evidence and the on-chain record of the tranche release.
 */
export default function MilestoneCard({
  milestone,
  defaultExpanded = false,
}: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const meta = MILESTONE_STATUS_META[milestone.status];
  const panelId = `milestone-panel-${milestone.id}`;
  const isReleased = milestone.status === "released";

  return (
    <article
      className={`glass-panel rounded-3xl transition-colors ${
        milestone.status === "pending" ? "opacity-75 hover:opacity-100" : ""
      } ${expanded ? "border-sky-500/25" : ""}`}
    >
      <div className="space-y-5 p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold ${INDEX_CLASSES[milestone.status]}`}
            aria-hidden="true"
          >
            {isReleased ? "✓" : milestone.index}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-white">{milestone.title}</h3>
              <StatusBadge status={milestone.status} />
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              {milestone.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <div>
            <p className="text-xs text-slate-500">Escrow tranche</p>
            <p className="text-lg font-bold text-white">
              {formatUsdc(milestone.trancheAmount, true)}
            </p>
            <p className="text-[11px] text-slate-500">
              {milestone.tranchePercent}% of total escrow
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Payout status</p>
            <p
              className={`text-lg font-bold ${isReleased ? "text-emerald-400" : "text-slate-400"}`}
            >
              {isReleased ? "Paid out" : "Locked"}
            </p>
            <p className="text-[11px] text-slate-500">
              {isReleased ? "Released to contractor" : "Held in BuildEscrow"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Construction progress</span>
            <span className="font-semibold text-slate-200">{milestone.progress}%</span>
          </div>
          <ProgressBar
            value={milestone.progress}
            tone={PROGRESS_TONE[milestone.status]}
            size="sm"
            striped={milestone.status === "in_progress"}
            label={`${milestone.title} construction progress`}
          />
          <p className="text-xs text-slate-500">{meta.hint}</p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <span>
            {milestone.evidence.length > 0
              ? `${milestone.evidence.length} site ${milestone.evidence.length === 1 ? "photo" : "photos"} & records`
              : "Milestone records"}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div id={panelId} className="space-y-5 border-t border-white/5 pt-5">
            <EvidenceGallery
              evidence={milestone.evidence}
              milestoneTitle={`Milestone ${milestone.index}`}
            />

            <div className="divide-y divide-white/5">
              <MetaRow label="Started">
                {milestone.startedAt ? formatDate(milestone.startedAt) : "—"}
              </MetaRow>
              <MetaRow label="Completed">
                {milestone.completedAt ? formatDate(milestone.completedAt) : "—"}
              </MetaRow>
              <MetaRow label="Inspector">
                {milestone.inspector ?? "Not yet assigned"}
              </MetaRow>
              <MetaRow label="Release transaction">
                {milestone.releaseTxHash ? (
                  <a
                    href={`${EXPLORER_TX_URL}/${milestone.releaseTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-sky-400 underline-offset-4 hover:underline"
                  >
                    {truncateHash(milestone.releaseTxHash, 8, 8)}
                  </a>
                ) : (
                  <span className="text-slate-500">Pending release</span>
                )}
              </MetaRow>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
