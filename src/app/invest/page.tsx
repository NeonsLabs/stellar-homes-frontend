"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function InvestPage() {
  const [selectedPool, setSelectedPool] = useState("Lagos");
  const [supplyAmount, setSupplyAmount] = useState("");
  const [isSupplying, setIsSupplying] = useState(false);
  const [supplySuccess, setSupplySuccess] = useState(false);

  const poolsInfo: { [key: string]: { name: string; apy: number; tvl: number } } = {
    Lagos: { name: "Lagos Mortgage Pool A", apy: 10.5, tvl: 450000 },
    Accra: { name: "Accra Residential Pool B", apy: 8.2, tvl: 280000 },
    Nairobi: { name: "Nairobi Commercial Pool C", apy: 11.2, tvl: 620000 },
  };

  const currentPool = poolsInfo[selectedPool];
  const calculatedReturn = supplyAmount ? (parseFloat(supplyAmount) * currentPool.apy) / 100 : 0;

  const handleSupplyLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplyAmount || parseFloat(supplyAmount) <= 0) return;
    setIsSupplying(true);
    setTimeout(() => {
      setIsSupplying(false);
      setSupplySuccess(true);
      setSupplyAmount("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] relative selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* Ambient background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-10 left-1/4 h-[500px] w-[500px] rounded-full bg-sky-500/5 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 shadow-lg shadow-sky-500/20">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Stellar<span className="text-sky-400">Homes</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <Link href="/properties" className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="/invest" className="text-white">Invest</Link>
            <Link href="/trustee" className="hover:text-white transition-colors">Trustee</Link>
            <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
            <Link href="/kyc" className="hover:text-white transition-colors">KYC Profile</Link>
            <Link href="/contracts" className="hover:text-white transition-colors">Ledger</Link>
          </nav>
          <div>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-500/25 transition-all">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Liquidity Pools</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">Mortgage Investor Portal</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Provide USDC liquidity to global diaspora mortgage pools. Earn passive yield backed by physical land assets and secured monthly interest repayments on Stellar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Supply Liquidity Form (Commit 8) */}
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-lg font-bold text-white mb-4">Supply USDC Liquidity</h2>
            {supplySuccess ? (
              <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
                <svg className="w-12 h-12 text-emerald-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-white font-bold mb-1">Transaction Successful!</h3>
                <p className="text-slate-400 text-sm mb-4">USDC supplied. You will start earning yield once block confirmation anchors.</p>
                <button
                  onClick={() => setSupplySuccess(false)}
                  className="px-4 py-2 text-xs font-bold text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/10 transition-colors uppercase tracking-wider"
                >
                  Supply More
                </button>
              </div>
            ) : (
              <form onSubmit={handleSupplyLiquidity} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Pool</label>
                  <select
                    value={selectedPool}
                    onChange={(e) => setSelectedPool(e.target.value)}
                    className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Lagos">Lagos Pool (10.5% APY)</option>
                    <option value="Accra">Accra Pool (8.2% APY)</option>
                    <option value="Nairobi">Nairobi Pool (11.2% APY)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Supply Amount (USDC)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={supplyAmount}
                      onChange={(e) => setSupplyAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                    <span className="absolute right-4 top-2.5 text-slate-500 font-bold text-sm">USDC</span>
                  </div>
                </div>

                {supplyAmount && (
                  <div className="p-4 rounded-xl bg-[#0d1321] border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold uppercase">Estimated Annual Return</span>
                      <span className="text-emerald-400 font-semibold">+{calculatedReturn.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2">
                      <span className="text-slate-500 font-bold uppercase">Stellar Network Fee</span>
                      <span className="text-slate-400">0.0001 XLM (~$0.00001)</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSupplying}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isSupplying ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Confirming on Stellar...
                    </>
                  ) : (
                    "Supply Liquidity"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Pool Charts Placeholder (Commit 9) */}
          <div className="min-h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
            <p className="text-slate-500 text-sm">Yield statistics are loading...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
