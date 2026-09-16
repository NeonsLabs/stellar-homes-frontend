"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import { api } from "@/lib/api";
import { formatCompactUsdc, toBig } from "@/lib/format";
import { useApi } from "@/lib/useApi";

/** Headline figures read from the contracts through the backend. */
export default function LiveStats() {
  const { stats } = useApp();
  const { data: pool } = useApi("pool", () => api.pool());
  const { data: properties } = useApi("properties:0", () => api.properties(0, 100));

  const items = [
    {
      label: "Pool funds",
      value: pool ? formatCompactUsdc(toBig(pool.totalCapital) + toBig(pool.totalLent)) : "—",
      tone: "text-sky-400",
    },
    { label: "Lent to builds", value: pool ? formatCompactUsdc(pool.totalLent) : "—", tone: "text-emerald-400" },
    { label: "Properties registered", value: properties ? String(properties.total) : "—", tone: "text-sky-400" },
    {
      label: "Interest paid to investors",
      value: pool ? formatCompactUsdc(pool.totalInterest) : "—",
      tone: "text-emerald-400",
    },
  ];

  return (
    <section className="border-y border-white/5 bg-slate-900/40 py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className={`text-3xl font-extrabold md:text-4xl ${item.tone}`}>{item.value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500 uppercase md:text-sm">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-slate-600">
        {stats
          ? stats.ledger === "soroban"
            ? `Live from the contracts on Stellar ${stats.network}.`
            : "From the backend's simulated ledger."
          : "Waiting for the backend…"}
      </p>
    </section>
  );
}
