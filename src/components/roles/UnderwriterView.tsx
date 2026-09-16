"use client";

import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { useApp } from "@/components/providers/AppProvider";
import Address from "@/components/ui/Address";
import { MortgageStatusBadge } from "@/components/ui/Badge";
import { MissingRole, RequireAccount } from "@/components/ui/Gates";
import Panel from "@/components/ui/Panel";
import StatTile from "@/components/ui/StatTile";
import { EmptyState, ErrorNotice, Loading } from "@/components/ui/States";
import { api, MortgageStatus } from "@/lib/api";
import { formatBps, formatUsdc, percentOf, toBig } from "@/lib/format";
import { useRoles } from "@/lib/hooks";
import { scanLiveMortgages } from "@/lib/scan";
import { useApi } from "@/lib/useApi";

const STATUS_ORDER: MortgageStatus[] = ["Applied", "Approved", "Funded", "Repaying", "PaidOff", "Defaulted"];

export default function UnderwriterView() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Underwriter" title="Applications">
        Approve or decline mortgage applications. Approval commits the whole facility against the pool immediately, so
        it stops being withdrawable while the house is built.
      </PageHeader>
      <RequireAccount purpose="underwrite">
        <Underwriter />
      </RequireAccount>
    </main>
  );
}

function Underwriter() {
  const { roles, loading } = useRoles();
  const { data, error } = useApi(roles?.underwriter ? "live-mortgages" : null, scanLiveMortgages);
  const { data: pool } = useApi("pool", () => api.pool());
  const { data: stats } = useApi("mortgage-pool-stats", () => api.mortgagePoolStats());

  if (!roles && loading) return <Loading label="Checking roles…" />;
  if (!roles?.underwriter) return <MissingRole role="underwriter" />;

  const applied = data?.filter((x) => x.mortgage.status === "Applied") ?? [];
  const others = data?.filter((x) => x.mortgage.status !== "Applied") ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Pending applications" value={data ? String(applied.length) : "…"} accent="amber" />
        <StatTile label="Pool available" value={pool ? formatUsdc(pool.available, { whole: true }) : "…"} accent="emerald" />
        <StatTile label="Committed, undrawn" value={pool ? formatUsdc(pool.totalReserved, { whole: true }) : "…"} accent="sky" />
        <StatTile
          label="Loans by status"
          value={stats?.mortgages ? String(stats.mortgages.total) : "—"}
          hint={
            stats?.mortgages
              ? STATUS_ORDER.filter((s) => stats.mortgages!.byStatus[s])
                  .map((s) => `${stats.mortgages!.byStatus[s]} ${s}`)
                  .join(" · ") || "None yet"
              : "Needs an indexer on-chain"
          }
        />
      </div>

      {error ? (
        <ErrorNotice error={error} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          <Panel title="Waiting for a decision">
            {applied.length === 0 ? (
              <EmptyState title="No applications waiting" />
            ) : (
              <MortgageTable rows={applied} available={toBig(pool?.available)} />
            )}
          </Panel>
          <Panel title="Live loans">
            {others.length === 0 ? <EmptyState title="No live loans" /> : <MortgageTable rows={others} />}
          </Panel>
        </>
      )}
    </div>
  );
}

function MortgageTable({
  rows,
  available,
}: {
  rows: Awaited<ReturnType<typeof scanLiveMortgages>>;
  available?: bigint;
}) {
  const { stats } = useApp();
  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase">
            <th className="px-2 py-2 font-semibold">Loan</th>
            <th className="px-2 py-2 font-semibold">Borrower</th>
            <th className="px-2 py-2 text-right font-semibold">Facility</th>
            <th className="px-2 py-2 text-right font-semibold">LTV</th>
            <th className="px-2 py-2 text-right font-semibold">Rate / term</th>
            <th className="px-2 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map(({ mortgage, property }) => {
            const ltv = percentOf(mortgage.principal, property.usdcValue);
            const unaffordable = available !== undefined && toBig(mortgage.principal) > available;
            return (
              <tr key={mortgage.id}>
                <td className="px-2 py-3">
                  <Link href={`/mortgages/${mortgage.id}`} className="font-semibold text-sky-300 hover:underline">
                    #{mortgage.id}
                  </Link>
                  <span className="text-slate-500"> · property #{property.id}</span>
                </td>
                <td className="px-2 py-3">
                  <Address value={mortgage.borrower} />
                </td>
                <td className={`px-2 py-3 text-right font-mono ${unaffordable ? "text-rose-300" : "text-white"}`}>
                  {formatUsdc(mortgage.principal, { whole: true })}
                </td>
                <td className={`px-2 py-3 text-right ${ltv > 80 ? "text-rose-300" : "text-slate-300"}`}>{ltv.toFixed(1)}%</td>
                <td className="px-2 py-3 text-right text-slate-300">
                  {formatBps(mortgage.rateBps)} · {mortgage.termMonths}m
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <MortgageStatusBadge status={mortgage.status} />
                    {mortgage.live.isDefaultable && <span className="text-xs text-rose-300">past grace</span>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {available !== undefined && stats && (
        <p className="px-2 pt-3 text-xs text-slate-500">
          Open a loan to approve or decline it. Facilities in red exceed the capital currently available.
        </p>
      )}
    </div>
  );
}
