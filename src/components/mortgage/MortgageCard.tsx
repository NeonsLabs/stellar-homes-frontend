import React from "react";
import Link from "next/link";
import { MortgageStatusBadge } from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Mortgage } from "@/lib/api";
import { formatBps, formatLedgerDate, formatUsdc, percentOf, toBig } from "@/lib/format";

/** Summary of a stored mortgage record, linking to its live view. */
export default function MortgageCard({ mortgage }: { mortgage: Mortgage }) {
  const due = toBig(mortgage.nextPaymentDue);
  return (
    <Link href={`/mortgages/${mortgage.id}`} className="glass-panel hover-glow flex flex-col gap-4 rounded-3xl p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Mortgage #{mortgage.id}</p>
          <p className="text-lg font-bold text-white">Property #{mortgage.propertyId}</p>
        </div>
        <MortgageStatusBadge status={mortgage.status} />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Released</span>
          <span>
            {formatUsdc(mortgage.disbursed, { whole: true })} / {formatUsdc(mortgage.principal, { whole: true })}
          </span>
        </div>
        <ProgressBar value={percentOf(mortgage.disbursed, mortgage.principal)} label="Facility released" size="sm" />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-slate-500">Principal owed</dt>
          <dd className="font-semibold text-white">{formatUsdc(mortgage.outstanding, { whole: true })}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Rate</dt>
          <dd className="font-semibold text-white">{formatBps(mortgage.rateBps)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Next due</dt>
          <dd className="font-semibold text-white">{due > 0n ? formatLedgerDate(mortgage.nextPaymentDue) : "—"}</dd>
        </div>
      </dl>
    </Link>
  );
}
