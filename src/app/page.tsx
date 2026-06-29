"use client";

import React, { useState } from "react";

export default function LandingPage() {
  // Calculator State
  const [propertyValue, setPropertyValue] = useState<number>(150000);
  const [ltv, setLtv] = useState<number>(60);
  const [termYears, setTermYears] = useState<number>(10);
  
  // Interactive Stepper State
  const [activeStep, setActiveStep] = useState<number>(0);

  // Calculator Logic
  const loanAmount = (propertyValue * ltv) / 100;
  const requiredCollateral = propertyValue; // 100% of PROP tokens must be locked as collateral
  const annualInterestRate = 0.08; // 8% fixed interest
  const monthlyInterestRate = annualInterestRate / 12;
  const totalMonths = termYears * 12;
  
  // Amortization Formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const monthlyRepayment = 
    loanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
    (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
  
  const totalRepayment = monthlyRepayment * totalMonths;
  const foundationTranche = loanAmount * 0.20; // 20% for Foundation

  const steps = [
    {
      title: "1. Title Submission & Verification",
      desc: "Trustee uploads land title deeds and surveys. Our automated oracle queries MLHUD (Nigeria) or Lands Commission (Ghana) to verify ownership and check for encumbrances.",
      details: "Results are anchored on-chain to create an immutable record of validity."
    },
    {
      title: "2. Valuation & Tokenization",
      desc: "A licensed surveyor conducts an official property valuation. The PropertyRegistry contract mints divisible, compliant PROP tokens representing fractional equity.",
      details: "Tokens are issued with AUTH_REQUIRED (KYC-gating) and CLAWBACK flags enabled."
    },
    {
      title: "3. Mortgage Funding & Escrow Lock",
      desc: "Diaspora member locks their PROP tokens as collateral in the MortgagePool. The pool issues a USDC loan (up to 70% LTV) and locks it directly into the BuildEscrow contract.",
      details: "Funds are sourced from global mortgage investors who earn yield on repayment."
    },
    {
      title: "4. Milestone-Gated Build",
      desc: "As the construction progresses, the trustee uploads photo and inspector evidence to IPFS. The oracle verifies it, and the escrow contract releases USDC tranches directly to builders.",
      details: "Borrowers never touch the cash directly, eliminating diversion risks."
    },
    {
      title: "5. Monthly Repayments & Release",
      desc: "The diaspora member makes monthly USDC repayments. Once the mortgage is fully repaid, the PROP tokens are unlocked and returned, completing the cycle.",
      details: "Repayments are split into principal (returned to pool) and interest (to investors)."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] relative selection:bg-sky-500 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Stellar<span className="text-sky-400">Homes</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#calculator" className="hover:text-white transition-colors">Mortgage Calculator</a>
            <a href="#contracts" className="hover:text-white transition-colors">Smart Contracts</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              id="btn-dapp-launch"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center md:text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                Now Live on Stellar Testnet
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Secure & Compliant <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
                  Diaspora Home Financing
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                StellarHomes connects diaspora members, local builders, trustees, and mortgage investors through milestone-gated escrows. Secure your home build on-chain with 100% transparent construction tracking.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <a 
                  id="hero-cta-primary"
                  href="#calculator"
                  className="w-full sm:w-auto text-center px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-95 shadow-lg shadow-sky-500/10 transition-all hover:-translate-y-0.5"
                >
                  Calculate Mortgage
                </a>
                <a 
                  id="hero-cta-secondary"
                  href="#how-it-works"
                  className="w-full sm:w-auto text-center px-8 py-4 rounded-xl glass-panel border border-white/10 text-white font-semibold hover:bg-white/5 transition-all hover:-translate-y-0.5"
                >
                  Explore Workflow
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              {/* Main Visual Glass Panel */}
              <div className="glass-panel glass-card-glow rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full filter blur-2xl"></div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Active Property Escrow</span>
                      <h3 className="text-lg font-bold">Property #0812-NG</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                      Phase 2: Walls
                    </span>
                  </div>

                  {/* Escrow Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>USDC Escrow Released</span>
                      <span className="font-semibold text-sky-400">45% ($67,500 / $150,000)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500 text-sky-400 flex items-center justify-center text-xs">✓</div>
                      <span className="text-slate-300">Foundation (20%) — <span className="text-slate-500">Released</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-xs">●</div>
                      <span className="font-semibold text-emerald-300">Structural Walls (25%) — <span className="text-emerald-400">In Progress</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-xs">3</div>
                      <span>Roofing (20%) — <span className="text-slate-600">Pending</span></span>
                    </div>
                  </div>

                  {/* Trust indicator */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">On-Chain Verification</p>
                      <p className="text-sm font-semibold text-slate-200">Oracle verified via MLHUD Registry</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-white/5 bg-slate-900/40 py-10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-sky-400">$14.2M</p>
              <p className="text-xs md:text-sm text-slate-500 uppercase font-semibold mt-1">Total Value Locked</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-emerald-400">128</p>
              <p className="text-xs md:text-sm text-slate-500 uppercase font-semibold mt-1">Active Home Builds</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-sky-400">&lt; 3.8s</p>
              <p className="text-xs md:text-sm text-slate-500 uppercase font-semibold mt-1">Average Settlement</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-emerald-400">0%</p>
              <p className="text-xs md:text-sm text-slate-500 uppercase font-semibold mt-1">Capital Diversion Rate</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Key Architectural Features</h2>
            <p className="text-slate-400">Built on Stellar and Soroban, StellarHomes enforces compliance, transparency, and safety at every layer of the home financing process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel glass-card-glow rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Compliant Tokenization</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every property's equity is represented on-chain using compliant <strong>PROP</strong> tokens. Standard features include <code>AUTH_REQUIRED</code> for KYC gating and <code>CLAWBACK_ENABLED</code> for asset protection.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel glass-card-glow rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Milestone-Gated Escrow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Funds are held securely in a Soroban <strong>BuildEscrow</strong> contract. Payouts are released in tranches directly to local pre-vetted contractors only after verified milestone proof is written on-chain.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel glass-card-glow rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Mortgage Liquidity Pools</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Investors supply USDC to the global mortgage pool to earn competitive yields. Borrowers secure mortgages by locking PROP tokens as collateral, with LTV protections and automated liquidation safety rails.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works (Interactive Stepper) */}
        <section id="how-it-works" className="border-t border-white/5 bg-slate-900/20 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs text-sky-400 uppercase font-semibold tracking-wider">Step-by-Step Guide</span>
                <h2 className="text-3xl md:text-4xl font-bold">How StellarHomes Works</h2>
                <p className="text-slate-400">
                  We bridge the gap between international finance and local construction. Click through the steps to see the lifecycle.
                </p>
                
                <div className="flex flex-col gap-2">
                  {steps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${activeStep === idx ? 'bg-sky-500/10 text-sky-400 font-bold border-l-4 border-sky-500' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <span>{step.title.split('.')[1].trim()}</span>
                      <span className="text-xs opacity-60">0{idx + 1}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="glass-panel glass-card-glow rounded-3xl p-8 lg:p-10 space-y-6 relative overflow-hidden min-h-[350px] flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/5 rounded-full filter blur-2xl"></div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-semibold">Workflow Detail</span>
                      <span className="text-sm font-bold text-sky-400">Step {activeStep + 1} of 5</span>
                    </div>
                    <h3 className="text-2xl font-bold">{steps[activeStep].title}</h3>
                    <p className="text-slate-300 leading-relaxed">{steps[activeStep].desc}</p>
                    <p className="text-slate-500 text-sm italic">{steps[activeStep].details}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-6">
                    <button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ← Previous
                    </button>
                    <button
                      disabled={activeStep === steps.length - 1}
                      onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-lg bg-sky-500 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section id="calculator" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs text-emerald-400 uppercase font-semibold tracking-wider">Interactive Simulator</span>
            <h2 className="text-3xl md:text-4xl font-bold">Mortgage & Collateral Calculator</h2>
            <p className="text-slate-400">Simulate your home build mortgage. Adjust the property value and see the required collateral, monthly payments, and milestone escrows.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Side */}
            <div className="lg:col-span-6 glass-panel rounded-3xl p-8 space-y-8">
              {/* Property Value Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-300">Property Valuation (USDC)</label>
                  <span className="text-lg font-bold text-sky-400">${propertyValue.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="50000" 
                  max="500000" 
                  step="5000"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>$50K</span>
                  <span>$250K</span>
                  <span>$500K</span>
                </div>
              </div>

              {/* LTV Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-300">Loan-To-Value (LTV) Ratio</label>
                  <span className="text-lg font-bold text-emerald-400">{ltv}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="70" 
                  step="5"
                  value={ltv}
                  onChange={(e) => setLtv(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>10% (Min)</span>
                  <span>Max 70% (LTV Limit)</span>
                </div>
              </div>

              {/* Term Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 block">Loan Repayment Term</label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 15].map((years) => (
                    <button
                      key={years}
                      onClick={() => setTermYears(years)}
                      className={`py-3 rounded-xl border font-semibold text-sm transition-all ${termYears === years ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                    >
                      {years} Years
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Side */}
            <div className="lg:col-span-6 glass-panel glass-card-glow rounded-3xl p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-2xl"></div>
              <h3 className="text-lg font-bold border-b border-white/5 pb-4">Simulated Mortgage Terms</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400">USDC Loan Amount</p>
                  <p className="text-2xl font-bold text-white">${loanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-[10px] text-slate-500">Issued from MortgagePool</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Required PROP Collateral</p>
                  <p className="text-2xl font-bold text-white">${requiredCollateral.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">Locked in MortgagePool</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-6">
                <div>
                  <p className="text-xs text-slate-400">Estimated Monthly Pay</p>
                  <p className="text-3xl font-extrabold text-sky-400">${monthlyRepayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-slate-500">Fixed 8.00% APR</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Foundation Tranche (20%)</p>
                  <p className="text-2xl font-bold text-emerald-400">${foundationTranche.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-[10px] text-slate-500">First escrow release</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Interest rate:</span>
                  <span className="font-semibold text-slate-200">8.00% p.a. (Fixed)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total payments over term:</span>
                  <span className="font-semibold text-slate-200">${totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. interest cost:</span>
                  <span className="font-semibold text-slate-200">${(totalRepayment - loanAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button 
                id="btn-calc-apply"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-95 shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5"
              >
                Apply for Mortgage
              </button>
            </div>
          </div>
        </section>

        {/* Smart Contracts Section */}
        <section id="contracts" className="border-t border-white/5 bg-slate-900/40 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-xs text-sky-400 uppercase font-semibold tracking-wider">On-Chain Layer</span>
              <h2 className="text-3xl md:text-4xl font-bold">Core Smart Contracts</h2>
              <p className="text-slate-400">Our decentralized architecture is powered by three main Soroban smart contracts, designed for security and compliance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#161f30]/50 border border-white/5 rounded-3xl p-8 space-y-4">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wide">01 / Property Registry</div>
                <h3 className="text-xl font-bold">PropertyRegistry</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Handles property verification and tokenization. It records IPFS title hashes, trustees, valuations, and manages the issuance of compliance-gated PROP tokens.
                </p>
                <div className="text-xs font-mono text-slate-500 pt-4">
                  Functions:<br />
                  • submit_property()<br />
                  • verify_property()<br />
                  • set_valuation()<br />
                  • mint_property_tokens()
                </div>
              </div>

              <div className="bg-[#161f30]/50 border border-white/5 rounded-3xl p-8 space-y-4">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">02 / Mortgage Pool</div>
                <h3 className="text-xl font-bold">MortgagePool</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Manages liquidity deposits, collateral locking, and mortgage issuance. Ensures LTV parameters do not exceed 70% and coordinates defaults and liquidations.
                </p>
                <div className="text-xs font-mono text-slate-500 pt-4">
                  Functions:<br />
                  • deposit_liquidity()<br />
                  • lock_collateral()<br />
                  • issue_mortgage()<br />
                  • repay()<br />
                  • trigger_default()
                </div>
              </div>

              <div className="bg-[#161f30]/50 border border-white/5 rounded-3xl p-8 space-y-4">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wide">03 / Build Escrow</div>
                <h3 className="text-xl font-bold">BuildEscrow</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Securely holds USDC funds and releases them to contractors in tranches based on verified milestone submissions, preventing the diversion of construction capital.
                </p>
                <div className="text-xs font-mono text-slate-500 pt-4">
                  Functions:<br />
                  • receive_funds()<br />
                  • submit_milestone()<br />
                  • verify_milestone()<br />
                  • release_tranche()<br />
                  • halt()
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="glass-panel glass-card-glow rounded-3xl p-12 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Ready to Secure Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400">Home Build on Stellar?</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Join the future of transparent real estate financing. Connect your wallet, calculate your loan, and start your building project today.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                id="cta-dapp-launch-large"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-95 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5"
              >
                Launch App
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#070b12] py-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-white">StellarHomes</span>
          </div>

          <div>
            <p>© 2026 StellarHomes. Built on Stellar Soroban Smart Contracts.</p>
          </div>

          <div className="flex gap-6">
            <a href="https://github.com/NeonsLabs/Stellar-Homes" className="hover:text-white transition-colors">GitHub</a>
            <a href="file:///home/dp/Documents/Stellar-Homes/ARCHITECTURE.md" className="hover:text-white transition-colors">Architecture</a>
            <a href="file:///home/dp/Documents/Stellar-Homes/CONTRIBUTING.md" className="hover:text-white transition-colors">Contributing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
