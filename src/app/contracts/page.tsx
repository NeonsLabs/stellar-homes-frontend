"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ContractsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredEvents = MOCK_EVENTS.filter((evt) => {
    if (selectedFilter === "All") return true;
    return evt.type === selectedFilter;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] relative selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* Ambient background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute bottom-10 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
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
            <Link href="/invest" className="hover:text-white transition-colors">Invest</Link>
            <Link href="/trustee" className="hover:text-white transition-colors">Trustee</Link>
            <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
            <Link href="/kyc" className="hover:text-white transition-colors">KYC Profile</Link>
            <Link href="/contracts" className="text-white">Ledger</Link>
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
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">On-Chain Event Ledger</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">Stellar Contract Explorer</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Audit live smart contract activities, oracle property verifications, and monthly mortgage repayment blocks on the Stellar network ledger.
          </p>
        </div>

        {/* Filter Capsules (Commit 20) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", "Oracle", "Compliance", "Liquidity", "Repayment"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                selectedFilter === type
                  ? "bg-sky-500 border-sky-600 text-white shadow-lg shadow-sky-500/20"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Event List (Commit 20) */}
        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0d1321]/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Transaction Hash</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono text-sky-300 select-all">{evt.txHash}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        evt.type === "Oracle" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                        evt.type === "Compliance" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        evt.type === "Liquidity" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      }`}>
                        {evt.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{evt.details}</td>
                    <td className="p-4 font-mono text-[10px] text-slate-500">{evt.time}</td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-md">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
                        Success
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

const MOCK_EVENTS = [
  {
    id: 1,
    txHash: "GBC4...X7ZW",
    type: "Oracle",
    details: "Land title deed registration verification anchor for EKO-4A",
    time: "2026-08-07 14:15:32",
  },
  {
    id: 2,
    txHash: "GDD5...Y7XW",
    type: "Compliance",
    details: "AUTH_REQUIRED flag approval for wallet address GD4SR...YYYY",
    time: "2026-08-07 13:42:01",
  },
  {
    id: 3,
    txHash: "GCC6...Z7XW",
    type: "Liquidity",
    details: "USDC 25,000 supplied to Lagos Mortgage Pool A",
    time: "2026-08-07 12:20:15",
  },
  {
    id: 4,
    txHash: "GAA7...W7XW",
    type: "Repayment",
    details: "Borrower GC8PK...XXXX repayment of USDC 1,820 recorded",
    time: "2026-08-07 11:05:45",
  },
  {
    id: 5,
    txHash: "GBD8...A7XW",
    type: "Oracle",
    details: "Milestone 1 foundation report audit approved for EKO-4A",
    time: "2026-08-07 09:30:12",
  }
];
