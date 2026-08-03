"use client";

import React, { useMemo } from "react";
import MilestoneTracker from "./MilestoneTracker";
import ProgressBar from "./ProgressBar";
import PropertyOverview from "./PropertyOverview";
import StatTile from "./StatTile";
import { formatUsdc } from "@/lib/format";
import { getBuildProgress, getLoanPosition } from "@/lib/dashboard";
import type { BorrowerDashboardData } from "@/types/dashboard";

/**
 * Client shell for the borrower dashboard.
 *
 * Owns the interactive state that spans sections (milestone filters live in
 * the tracker itself) and derives the headline figures from a single source so
 * the tiles can never disagree with the sections below them.
 */
export default function BorrowerDashboard({
  data,
}: {
  data: BorrowerDashboardData;
}) {
  const { borrower, property, mortgage, escrow, milestones, invoices } = data;

  const buildProgress = useMemo(() => getBuildProgress(milestones), [milestones]);
  const position = useMemo(
    () => getLoanPosition(invoices, mortgage),
    [invoices, mortgage],
  );

  const awaitingVerification = milestones.filter(
    (milestone) => milestone.status === "verifying",
  ).length;

  return (
    <main className="relative mx-auto max-w-7xl space-y-10 px-6 py-10">
      <section id="overview" className="scroll-mt-24 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-slate-400">
            Welcome back, <span className="font-semibold text-white">{borrower.name.split(" ")[0]}</span>
          </p>
          <p className="text-xs text-slate-500">
            Here is where your build and your mortgage stand today.
          </p>
        </div>

        <PropertyOverview
          property={property}
          mortgage={mortgage}
          escrow={escrow}
          buildProgress={buildProgress}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Outstanding principal"
            value={formatUsdc(position.outstandingPrincipal, true)}
            hint={`of ${formatUsdc(mortgage.loanAmount, true)} borrowed`}
            accent="white"
            footer={
              <ProgressBar
                value={position.repaymentProgress}
                tone="sky"
                size="sm"
                label="Repayment term completed"
              />
            }
          />
          <StatTile
            label="Repaid to date"
            value={formatUsdc(position.totalPaid, true)}
            hint={`${position.paidCount} of ${mortgage.termMonths} instalments settled`}
            accent="emerald"
          />
          <StatTile
            label="Escrow released"
            value={formatUsdc(escrow.totalReleased, true)}
            hint={`${milestones.filter((milestone) => milestone.status === "released").length} of ${milestones.length} milestones verified`}
            accent="sky"
          />
          <StatTile
            label="Build completion"
            value={`${buildProgress.toFixed(1)}%`}
            hint={
              awaitingVerification > 0
                ? `${awaitingVerification} milestone awaiting oracle sign-off`
                : "All submitted proof verified"
            }
            accent="amber"
          />
        </div>
      </section>

      <MilestoneTracker milestones={milestones} />
    </main>
  );
}
