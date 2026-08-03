import React from "react";
import ProgressBar from "./ProgressBar";
import { Badge } from "./StatusBadge";
import { formatDate, formatUsdc, truncateHash } from "@/lib/format";
import { getEscrowProgress, getEscrowRemaining } from "@/lib/dashboard";
import type { Escrow, Mortgage, Property } from "@/types/dashboard";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}

export interface PropertyOverviewProps {
  property: Property;
  mortgage: Mortgage;
  escrow: Escrow;
  /** Weighted physical build completion, 0-100. */
  buildProgress: number;
}

/**
 * Hero panel: which property is being built, what the mortgage terms are, and
 * how much of the escrow has been released so far.
 */
export default function PropertyOverview({
  property,
  mortgage,
  escrow,
  buildProgress,
}: PropertyOverviewProps) {
  const escrowProgress = getEscrowProgress(escrow);

  return (
    <div className="glass-panel glass-card-glow relative overflow-hidden rounded-3xl p-6 md:p-8">
      <div
        className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="sky">Property #{property.id}</Badge>
              <Badge tone="emerald" dot>
                Title verified — {property.registry}
              </Badge>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                {property.title}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {property.location} · {property.plotSize}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:text-right">
            <p className="text-xs text-slate-500">Target handover</p>
            <p className="text-lg font-bold text-white">
              {formatDate(escrow.targetCompletion)}
            </p>
            <p className="text-[11px] text-slate-500">
              Verified {formatDate(property.verifiedAt)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Escrow released to contractors</span>
              <span className="font-semibold text-sky-400">
                {formatUsdc(escrow.totalReleased, true)} / {formatUsdc(escrow.totalFunded, true)}
              </span>
            </div>
            <ProgressBar
              value={escrowProgress}
              label="Escrow released to contractors"
              size="lg"
            />
            <p className="text-xs text-slate-500">
              {formatUsdc(getEscrowRemaining(escrow), true)} still locked in BuildEscrow{" "}
              <span className="font-mono">{truncateHash(escrow.contractId, 4, 4)}</span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Physical build completion</span>
              <span className="font-semibold text-emerald-400">
                {buildProgress.toFixed(1)}%
              </span>
            </div>
            <ProgressBar
              value={buildProgress}
              tone="emerald"
              label="Physical build completion"
              size="lg"
              striped
            />
            <p className="text-xs text-slate-500">
              Weighted by each milestone&apos;s share of the escrow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 md:grid-cols-3 lg:grid-cols-5">
          <Fact label="Surveyor valuation" value={formatUsdc(property.valuation, true)} />
          <Fact
            label="Mortgage / LTV"
            value={`${formatUsdc(mortgage.loanAmount, true)} · ${mortgage.ltv}%`}
          />
          <Fact
            label="PROP collateral locked"
            value={formatUsdc(mortgage.collateralLocked, true)}
          />
          <Fact label="Trustee" value={property.trustee} />
          <Fact label="Contractor" value={property.contractor} />
        </div>
      </div>
    </div>
  );
}
