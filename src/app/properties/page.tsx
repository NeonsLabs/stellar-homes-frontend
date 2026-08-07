"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedLtv, setSelectedLtv] = useState("All");

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] relative selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* Ambient background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
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
            <Link href="/properties" className="text-white">Marketplace</Link>
            <Link href="/invest" className="hover:text-white transition-colors">Invest</Link>
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
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Verified Marketplace</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">Tokenized Properties</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Explore premium land packages and residential developments in Sub-Saharan Africa. All titles are verified on-chain via legal oracle registries.
          </p>
        </div>

        {/* Filter Controls (Commit 4) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Search Properties</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="All">All Regions</option>
              <option value="Lagos, Nigeria">Lagos, Nigeria</option>
              <option value="Accra, Ghana">Accra, Ghana</option>
              <option value="Nairobi, Kenya">Nairobi, Kenya</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">LTV Limit</label>
            <select
              value={selectedLtv}
              onChange={(e) => setSelectedLtv(e.target.value)}
              className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="All">All LTV limits</option>
              <option value="50">Max 50% LTV</option>
              <option value="60">Max 60% LTV</option>
              <option value="70">Max 70% LTV</option>
            </select>
          </div>
        </div>

  const filteredProperties = MOCK_PROPERTIES.filter((prop) => {
    const matchesSearch =
      prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion =
      selectedRegion === "All" || prop.location === selectedRegion;
    const matchesLtv =
      selectedLtv === "All" || prop.ltv <= parseInt(selectedLtv);
    return matchesSearch && matchesRegion && matchesLtv;
  });

  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] relative selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* Ambient background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
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
            <Link href="/properties" className="text-white">Marketplace</Link>
            <Link href="/invest" className="hover:text-white transition-colors">Invest</Link>
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
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Verified Marketplace</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">Tokenized Properties</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Explore premium land packages and residential developments in Sub-Saharan Africa. All titles are verified on-chain via legal oracle registries.
          </p>
        </div>

        {/* Filter Controls (Commit 4) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Search Properties</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="All">All Regions</option>
              <option value="Lagos, Nigeria">Lagos, Nigeria</option>
              <option value="Accra, Ghana">Accra, Ghana</option>
              <option value="Nairobi, Kenya">Nairobi, Kenya</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">LTV Limit</label>
            <select
              value={selectedLtv}
              onChange={(e) => setSelectedLtv(e.target.value)}
              className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="All">All LTV limits</option>
              <option value="50">Max 50% LTV</option>
              <option value="60">Max 60% LTV</option>
              <option value="70">Max 70% LTV</option>
            </select>
          </div>
        </div>

        {/* Listings Grid (Commit 5) */}
        {filteredProperties.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-white/5 p-8 text-center">
            <p className="text-slate-400 font-medium">No properties match your filter criteria.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedRegion("All"); setSelectedLtv("All"); }}
              className="mt-4 text-xs font-bold text-sky-400 hover:text-sky-300 uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => (
              <div key={prop.id} className="group relative rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20">
                        {prop.tokenSymbol}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-sky-400 transition-colors">
                        {prop.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {prop.location}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {prop.desc}
                  </p>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mb-4">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Property Value</span>
                      <span className="text-sm font-semibold text-white">USDC {prop.price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">LTV Limit</span>
                      <span className="text-sm font-semibold text-emerald-400">{prop.ltv}% LTV</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProperty(prop)}
                    className="w-full text-center py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors"
                  >
                    View Title Registry
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1321]/95 p-6 relative shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">On-Chain Land Registry Title</span>
            <h2 className="text-xl font-bold text-white mt-1 mb-4">{selectedProperty.name}</h2>
            <div className="space-y-4 text-slate-300 text-sm">
              <div className="bg-[#0b0f19] border border-white/5 rounded-xl p-4 font-mono text-[11px] leading-relaxed">
                <p className="text-slate-500 mb-1">// Stellar Anchor Hash</p>
                <p className="text-sky-300 truncate">{selectedProperty.oracleHash}</p>
                <p className="text-slate-500 mt-3 mb-1">// Ministry of Lands / Registry ID</p>
                <p className="text-emerald-400">MLHUD-NG-{selectedProperty.id}938-L</p>
                <p className="text-slate-500 mt-3 mb-1">// Verification Status</p>
                <p className="text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Verified & Tokenized
                </p>
              </div>
              <p className="leading-relaxed text-slate-400">
                This asset was audited by our licensed local surveyors. The PROP tokens representing this land have been minted with the <code className="text-sky-300">AUTH_REQUIRED</code> and <code className="text-sky-300">CLAWBACK</code> flags set, conforming to SEC-compliant tokenized property regulations.
              </p>
              <div className="flex gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:shadow-lg hover:shadow-sky-500/20 text-white font-semibold text-xs transition-all"
                >
                  Request Financing
                </Link>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="flex-1 text-center py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Close Registry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_PROPERTIES = [
  {
    id: 1,
    name: "Eko Atlantic City Parcel 4A",
    location: "Lagos, Nigeria",
    price: 250000,
    ltv: 60,
    tokenSymbol: "EKO-4A",
    desc: "Premium commercial waterfront site ready for high-rise foundation works. Fully verified land title registry anchor.",
    oracleHash: "0x8fa2a2b00cd439e17b8f9e61204a3f19c",
    yield: 10.5
  },
  {
    id: 2,
    name: "Lekki Phase II Residential",
    location: "Lagos, Nigeria",
    price: 120000,
    ltv: 70,
    tokenSymbol: "LEK-RES",
    desc: "Multi-family residential zoning with pre-approved building plans. Gated access and infrastructure ready.",
    oracleHash: "0x91da5a1b32f2c8d76e737c35a1111111a",
    yield: 9.8
  },
  {
    id: 3,
    name: "East Legon Executive Plots",
    location: "Accra, Ghana",
    price: 180000,
    ltv: 50,
    tokenSymbol: "EL-EXE",
    desc: "Prime land package in premium East Legon corridor. Clear title verified with Accra Lands Commission.",
    oracleHash: "0xac4280cf237a6b9a8cf38b18a8ea9a90b",
    yield: 8.2
  },
  {
    id: 4,
    name: "Kilimani Heights Site B",
    location: "Nairobi, Kenya",
    price: 320000,
    ltv: 65,
    tokenSymbol: "KIL-HTS",
    desc: "Mixed-use plot close to the Central Business District. Ideal for diaspora construction mortgages.",
    oracleHash: "0x78effea2b90b8f9e61204a3f19ca1e1a2",
    yield: 11.2
  }
];

