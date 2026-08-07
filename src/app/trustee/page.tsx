"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TrusteePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] relative selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* Ambient background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
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
            <Link href="/trustee" className="text-white">Trustee</Link>
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
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Trustee & Builder Portal</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">Milestone Evidence Submission</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Upload construction photo evidence and structural reports. Our oracle verifies the milestone compliance to release escrowed USDC building tranches.
          </p>
        </div>

        {/* Placeholder for Photo Upload Simulator & Build Escrow Drawdowns (Steps 11 and 12) */}
        <div className="min-h-[400px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
          <p className="text-slate-500 text-sm">Trustee portal controls are loading...</p>
        </div>
      </main>
    </div>
  );
}
