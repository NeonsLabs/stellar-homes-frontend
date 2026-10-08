"use client";

import React from "react";

interface InvestorStatsProps {
  depositedUnits: bigint;
  claimableInterest: bigint;
  apyBps: number;
}

export const InvestorStats: React.FC<InvestorStatsProps> = ({
  depositedUnits,
  claimableInterest,
  apyBps,
}) => {
  const depositedUsdc = Number(depositedUnits) / 10_000_000;
  const interestUsdc = Number(claimableInterest) / 10_000_000;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <span className="text-xs text-slate-400 block">Total Deposited</span>
        <span className="text-2xl font-bold text-white mt-1 block">${depositedUsdc.toLocaleString()} USDC</span>
      </div>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <span className="text-xs text-slate-400 block">Claimable Interest</span>
        <span className="text-2xl font-bold text-emerald-400 mt-1 block">${interestUsdc.toLocaleString()} USDC</span>
      </div>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <span className="text-xs text-slate-400 block">Target APY</span>
        <span className="text-2xl font-bold text-blue-400 mt-1 block">{(apyBps / 100).toFixed(2)}%</span>
      </div>
    </div>
  );
};
