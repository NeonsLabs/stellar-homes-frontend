"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TrusteePage() {
  const [selectedProject, setSelectedProject] = useState("Lagos");
  const [selectedMilestone, setSelectedMilestone] = useState("Foundation");
  const [fileName, setFileName] = useState("");
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
    }, 2500);
  };

  const simulateFileSelect = () => {
    const names = [
      "foundation_inspection_north.jpg",
      "concrete_pouring_mix_report.pdf",
      "brickwork_level_one_photos.zip",
      "roofing_timber_truss_receipts.pdf",
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    setFileName(randomName);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] relative selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* Ambient background gradients */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 shadow-lg shadow-sky-500/20">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Stellar<span className="text-sky-400">Homes</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <Link
              href="/properties"
              className="hover:text-white transition-colors"
            >
              Marketplace
            </Link>
            <Link href="/invest" className="hover:text-white transition-colors">
              Invest
            </Link>
            <Link href="/trustee" className="text-white">
              Trustee
            </Link>
            <Link href="/learn" className="hover:text-white transition-colors">
              Learn
            </Link>
            <Link href="/kyc" className="hover:text-white transition-colors">
              KYC Profile
            </Link>
            <Link
              href="/contracts"
              className="hover:text-white transition-colors"
            >
              Ledger
            </Link>
          </nav>
          <div>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-500/25 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Trustee & Builder Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">
            Milestone Evidence Submission
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Upload construction photo evidence and structural reports. Our
            oracle verifies the milestone compliance to release escrowed USDC
            building tranches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Evidence Upload Form (Commit 11) */}
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              Submit Build Evidence
            </h2>
            {uploadSuccess ? (
              <div className="p-6 rounded-xl border border-sky-500/20 bg-sky-500/5 text-center">
                <svg
                  className="w-12 h-12 text-sky-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h3 className="text-white font-bold mb-1">
                  Evidence Dispatched!
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  File uploaded to IPFS. Stellar Smart Contract oracle check is
                  running in the background.
                </p>
                <button
                  onClick={() => {
                    setUploadSuccess(false);
                    setFileName("");
                    setEvidenceDesc("");
                  }}
                  className="px-4 py-2 text-xs font-bold text-sky-400 border border-sky-500/20 rounded-lg hover:bg-sky-500/10 transition-colors uppercase tracking-wider"
                >
                  New Upload
                </button>
              </div>
            ) : (
              <form onSubmit={handleUploadEvidence} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Build Site
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="Lagos">
                      Eko Atlantic City Parcel 4A (Lagos)
                    </option>
                    <option value="Lekki">
                      Lekki Phase II Residential (Lagos)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Target Milestone
                  </label>
                  <select
                    value={selectedMilestone}
                    onChange={(e) => setSelectedMilestone(e.target.value)}
                    className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="Foundation">
                      Milestone 1: Foundation (20% Tranche)
                    </option>
                    <option value="Lintels">
                      Milestone 2: Lintels & Columns (25% Tranche)
                    </option>
                    <option value="Roofing">
                      Milestone 3: Roofing & Enclosure (30% Tranche)
                    </option>
                    <option value="Finishes">
                      Milestone 4: Internal Finishes (25% Tranche)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Attach Files (Photos/PDF)
                  </label>
                  <div
                    onClick={simulateFileSelect}
                    className="border border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-sky-500/50 hover:bg-white/[0.02] transition-all"
                  >
                    <svg
                      className="w-8 h-8 text-slate-500 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {fileName ? (
                      <span className="text-sm font-semibold text-sky-400 font-mono">
                        {fileName}
                      </span>
                    ) : (
                      <>
                        <span className="block text-xs text-slate-400">
                          Click to select inspection document or photo
                        </span>
                        <span className="text-[10px] text-slate-500">
                          (Supports PNG, JPG, PDF up to 20MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Evidence Notes
                  </label>
                  <textarea
                    value={evidenceDesc}
                    onChange={(e) => setEvidenceDesc(e.target.value)}
                    placeholder="Provide comments regarding completion of this milestone..."
                    rows={3}
                    className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:shadow-lg hover:shadow-sky-500/25 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Hashing and Dispatched to IPFS...
                    </>
                  ) : (
                    "Upload and Submit Evidence"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Escrow Drawdowns (Commit 12) */}
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Escrow Release Timeline
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Site: {selectedProject}
                </span>
              </div>

              <div className="space-y-4">
                {selectedProject === "Lagos" ? (
                  <>
                    <div className="flex items-start gap-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] mt-0.5 font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-xs font-bold text-white">
                            Milestone 1: Foundation
                          </h4>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase">
                            USDC 50,000 Released
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Oracle verified construction photos and anchoring
                          signature.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl border border-sky-500/20 bg-sky-500/5">
                      <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] mt-0.5 font-bold">
                        →
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-xs font-bold text-sky-400">
                            Milestone 2: Lintels & Columns
                          </h4>
                          <span className="text-[10px] text-sky-400 font-bold uppercase">
                            USDC 62,500 Current
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Awaiting builder structural report upload and surveyor
                          confirmation.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl border border-white/5 bg-[#0d1321]/40 opacity-50">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-[10px] mt-0.5 font-bold">
                        3
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-xs font-bold text-slate-400">
                            Milestone 3: Roofing
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">
                            USDC 75,000 Locked
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-4 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                      <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-[10px] mt-0.5 font-bold">
                        ?
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-xs font-bold text-yellow-400">
                            Milestone 1: Foundation
                          </h4>
                          <span className="text-[10px] text-yellow-400 font-bold uppercase">
                            USDC 24,000 Under Review
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Milestone evidence submitted. Smart contract oracle
                          checking land survey logs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl border border-white/5 bg-[#0d1321]/40 opacity-50">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-[10px] mt-0.5 font-bold">
                        2
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-xs font-bold text-slate-400">
                            Milestone 2: Lintels
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">
                            USDC 30,000 Locked
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-[#0d1321]/40 text-xs text-slate-400 leading-relaxed">
              <span className="font-bold text-white block mb-1">
                ⛓️ Multi-Sig Escrow release
              </span>
              Funds are held in a BuildEscrow contract. Releasing tranches
              requires verification from the legal oracle and approval
              signatures from 2-of-3 multisig co-signers.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
