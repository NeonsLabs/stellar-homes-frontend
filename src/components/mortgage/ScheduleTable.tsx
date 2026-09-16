"use client";

import React, { useState } from "react";
import { EmptyState, ErrorNotice, Loading } from "@/components/ui/States";
import { api } from "@/lib/api";
import { formatLedgerDate, formatUsdc, toBig } from "@/lib/format";
import { useApi } from "@/lib/useApi";

const PREVIEW_ROWS = 12;

/** The backend's projection of the instalments still to come. */
export default function ScheduleTable({ mortgageId, now }: { mortgageId: string; now: bigint }) {
  const { data, error } = useApi(`schedule:${mortgageId}`, () => api.schedule(mortgageId));
  const [showAll, setShowAll] = useState(false);

  if (error) return <ErrorNotice error={error} />;
  if (!data) return <Loading label="Projecting schedule…" />;
  if (data.instalments.length === 0) return <EmptyState title="Nothing left to pay" />;

  const rows = showAll ? data.instalments : data.instalments.slice(0, PREVIEW_ROWS);
  const total = data.instalments.reduce((sum, r) => sum + toBig(r.payment), 0n);
  const interest = data.instalments.reduce((sum, r) => sum + toBig(r.interest), 0n);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="text-slate-400">
          {data.instalments.length} instalments left, totalling{" "}
          <span className="font-semibold text-white">{formatUsdc(total)}</span>
        </span>
        <span className="text-slate-400">
          of which interest <span className="font-semibold text-white">{formatUsdc(interest)}</span>
        </span>
      </div>
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 uppercase">
              <th className="px-2 py-2 font-semibold">#</th>
              <th className="px-2 py-2 font-semibold">Due</th>
              <th className="px-2 py-2 text-right font-semibold">Payment</th>
              <th className="px-2 py-2 text-right font-semibold">Interest</th>
              <th className="px-2 py-2 text-right font-semibold">Principal</th>
              <th className="px-2 py-2 text-right font-semibold">Balance after</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r, i) => {
              const late = now > 0n && toBig(r.dueAt) < now;
              return (
                <tr key={r.number} className={i === 0 ? "bg-sky-500/[0.06]" : undefined}>
                  <td className="px-2 py-2 text-slate-400">{r.number}</td>
                  <td className={`px-2 py-2 ${late ? "text-amber-300" : "text-slate-300"}`}>
                    {formatLedgerDate(r.dueAt)}
                    {i === 0 && <span className="ml-2 text-[10px] font-bold text-sky-300 uppercase">next</span>}
                  </td>
                  <td className="px-2 py-2 text-right font-mono font-semibold text-white">{formatUsdc(r.payment)}</td>
                  <td className="px-2 py-2 text-right font-mono text-slate-400">{formatUsdc(r.interest)}</td>
                  <td className="px-2 py-2 text-right font-mono text-slate-400">{formatUsdc(r.principal)}</td>
                  <td className="px-2 py-2 text-right font-mono text-slate-300">{formatUsdc(r.balanceAfter)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.instalments.length > PREVIEW_ROWS && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="text-sm font-semibold text-sky-300 hover:text-sky-200"
        >
          {showAll ? "Show fewer" : `Show all ${data.instalments.length}`}
        </button>
      )}
      {!data.clearsInFull && (
        <p className="text-xs text-amber-300/90">
          The projection stops before the balance reaches zero; a payoff clears whatever remains.
        </p>
      )}
    </div>
  );
}
