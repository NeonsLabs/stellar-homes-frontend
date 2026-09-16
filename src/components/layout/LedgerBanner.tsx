"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import { API_URL } from "@/lib/api";

/** One line under the header saying which ledger the backend is using. */
export default function LedgerBanner() {
  const { stats, statsError, refresh } = useApp();

  if (statsError && !stats) {
    return (
      <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-center text-xs text-rose-200">
        Cannot reach the backend at <span className="font-mono">{API_URL}</span>. Start{" "}
        <span className="font-mono">stellar-homes-backend</span> with <span className="font-mono">npm run dev</span>
        , then{" "}
        <button type="button" onClick={refresh} className="font-semibold underline">
          retry
        </button>
        .
      </div>
    );
  }
  if (!stats) return null;

  if (stats.ledger === "simulated") {
    return (
      <div className="border-b border-amber-500/15 bg-amber-500/[0.06] px-4 py-1.5 text-center text-xs text-amber-200/90">
        Simulated ledger: an in-memory copy of the contracts that checks no signatures. For development and demos only.
      </div>
    );
  }
  return (
    <div className="border-b border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-1.5 text-center text-xs text-emerald-200/90">
      Live on Stellar {stats.network}. Transactions are signed in Freighter.
    </div>
  );
}
