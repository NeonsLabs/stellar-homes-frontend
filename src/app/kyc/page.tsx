"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function KycPage() {
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [passportName, setPassportName] = useState("");
  const [utilityName, setUtilityName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [walletConnected, setWalletConnected] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [credentialsSigned, setCredentialsSigned] = useState(false);

  const handleConnectWallet = () => {
    setWalletConnected(true);
  };

  const handleSignCredentials = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setCredentialsSigned(true);
    }, 2000);
  };


  const handleSubmitKyc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !passportName || !utilityName) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 2000);
  };

  const simulatePassportUpload = () => {
    setPassportName("passport_page_biodata.jpg");
  };

  const simulateUtilityUpload = () => {
    setUtilityName("utility_bill_address_proof.pdf");
  };

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
            <Link href="/kyc" className="text-white">KYC Profile</Link>
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
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Compliance & Verification</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">KYC Profile Status</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Submit credentials to verify your identity. Approving your compliance status updates your wallet eligibility for the on-chain compliance flags.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* KYC Form Upload (Commit 17) */}
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-lg font-bold text-white mb-4">Identity Verification Form</h2>
            {submitSuccess ? (
              <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-3">
                <svg className="w-12 h-12 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-white font-bold">Documents Received</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Your identity details have been submitted. Our compliance team is verifying files. Check back shortly to sign and unlock your wallet.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-2 px-4 py-2 text-xs font-bold text-sky-400 border border-sky-500/20 rounded-lg hover:bg-sky-500/10 transition-colors uppercase tracking-wider"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitKyc} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Country of Residence</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#0d1321] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Passport Page</label>
                    <div
                      onClick={simulatePassportUpload}
                      className="border border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-sky-500/50 transition-colors text-xs"
                    >
                      {passportName ? (
                        <span className="text-emerald-400 truncate block font-mono font-semibold">{passportName}</span>
                      ) : (
                        <span className="text-slate-400 block py-2">Upload ID</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Proof of Address</label>
                    <div
                      onClick={simulateUtilityUpload}
                      className="border border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-sky-500/50 transition-colors text-xs"
                    >
                      {utilityName ? (
                        <span className="text-emerald-400 truncate block font-mono font-semibold">{utilityName}</span>
                      ) : (
                        <span className="text-slate-400 block py-2">Upload Address</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:shadow-lg hover:shadow-sky-500/25 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Submitting Documents...
                    </>
                  ) : (
                    "Submit Verification Documents"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Wallet Connection & Signing (Commit 18) */}
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Stellar Wallet Link</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Link your Stellar wallet to sign compliance transactions. Once approved, the platform issuer authorize flag will enable.
              </p>

              {!walletConnected ? (
                <button
                  onClick={handleConnectWallet}
                  className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connect Stellar Wallet
                </button>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-[#0d1321]/60 border border-white/5 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold uppercase">Connected Wallet</span>
                      <span className="text-emerald-400 font-bold uppercase">Active</span>
                    </div>
                    <p className="text-slate-300 font-mono break-all leading-relaxed">
                      GD4SR22BJLOH5G55YQYQW4Z7P2F2GZ5W6V4B7XWEXM6X3OYYYYYYYYYY
                    </p>
                  </div>

                  {credentialsSigned ? (
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold uppercase">Trustline Authorization</span>
                        <span className="text-emerald-400 font-bold uppercase">AUTHORIZED</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Your trustline is approved. The issuer asset flags are active. You can now hold and trade PROP tokens.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleSignCredentials}
                      disabled={isSigning}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      {isSigning ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Signing Credentials...
                        </>
                      ) : (
                        "Sign KYC Credentials"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-[#0d1321]/40 text-xs text-slate-400 leading-relaxed">
              <span className="font-bold text-white block mb-1">🔑 SEC-Compliant Signature</span>
              Your signature anchors your real identity hash to your public key. This conforms to SEC regulation compliance guidelines for asset-backed tokens.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
