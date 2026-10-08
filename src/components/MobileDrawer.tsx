"use client";

import React, { useState } from "react";
import Link from "next/link";

export const MobileDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg bg-slate-800 text-slate-300"
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 p-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-white text-lg">StellarHomes</span>
            <button onClick={() => setOpen(false)} className="text-white text-xl">✕</button>
          </div>
          <Link href="/properties" onClick={() => setOpen(false)} className="text-slate-300 text-lg">Properties</Link>
          <Link href="/invest" onClick={() => setOpen(false)} className="text-slate-300 text-lg">Invest</Link>
          <Link href="/kyc" onClick={() => setOpen(false)} className="text-slate-300 text-lg">KYC</Link>
          <Link href="/trustee" onClick={() => setOpen(false)} className="text-slate-300 text-lg">Trustee</Link>
        </div>
      )}
    </div>
  );
};
