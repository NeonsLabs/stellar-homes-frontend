"use client";

import React, { useState } from "react";

export const KycForm: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [nin, setNin] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-emerald-950/40 border border-emerald-800 p-6 text-center">
        <h3 className="text-lg font-bold text-emerald-300 mb-2">KYC Application Submitted</h3>
        <p className="text-sm text-slate-300">Smile ID identity verification is processing. Your wallet will be authorized shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
      <h3 className="text-lg font-bold text-white mb-2">Identity Verification (KYC)</h3>
      <div>
        <label className="text-xs text-slate-400 block mb-1">Full Legal Name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm"
          placeholder="e.g. John Doe"
        />
      </div>
      <div>
        <label className="text-xs text-slate-400 block mb-1">National ID / NIN</label>
        <input
          type="text"
          required
          value={nin}
          onChange={(e) => setNin(e.target.value)}
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm"
          placeholder="11-digit NIN"
        />
      </div>
      <button type="submit" className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white text-sm">
        Submit to Smile ID
      </button>
    </form>
  );
};
