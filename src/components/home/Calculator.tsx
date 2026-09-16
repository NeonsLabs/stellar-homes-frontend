"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MAX_RATE_BPS, projectFullyDrawn, STAGE_NAMES, trancheFor } from "@/lib/amortization";
import { formatBps, formatUsdc, USDC_DECIMALS } from "@/lib/format";

const UNIT = 10n ** BigInt(USDC_DECIMALS);
const TERMS = [5, 10, 15, 20];

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  accent = "accent-sky-400",
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  return (
    <label className="block space-y-3">
      <span className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-300">{label}</span>
        <span className="text-lg font-bold text-white">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 ${accent}`}
      />
    </label>
  );
}

/** A mortgage projected with the contract's own arithmetic, fully drawn. */
export default function Calculator() {
  const [value, setValue] = useState(150_000);
  const [ltv, setLtv] = useState(60);
  const [years, setYears] = useState(10);
  const [rateBps, setRateBps] = useState(850);

  const principal = (BigInt(value) * UNIT * BigInt(ltv)) / 100n;
  const projection = projectFullyDrawn(principal, years * 12, rateBps);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-12">
      <div className="glass-panel space-y-8 rounded-3xl p-6 sm:p-8 lg:col-span-6">
        <Slider
          label="Property valuation"
          value={value}
          display={formatUsdc(BigInt(value) * UNIT, { whole: true })}
          min={20_000}
          max={500_000}
          step={5_000}
          onChange={setValue}
        />
        <Slider
          label="Loan-to-value"
          value={ltv}
          display={`${ltv}%`}
          min={10}
          max={80}
          step={5}
          onChange={setLtv}
          accent="accent-emerald-400"
        />
        <Slider
          label="Annual rate"
          value={rateBps}
          display={formatBps(rateBps)}
          min={0}
          max={MAX_RATE_BPS}
          step={25}
          onChange={setRateBps}
        />
        <div className="space-y-3">
          <span className="block text-sm font-semibold text-slate-300">Term</span>
          <div className="grid grid-cols-4 gap-2">
            {TERMS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={years === t}
                onClick={() => setYears(t)}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                  years === t ? "border-sky-500 bg-sky-500/10 text-sky-300" : "border-white/5 bg-white/5 hover:bg-white/10"
                }`}
              >
                {t} yrs
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          The contract caps a loan at 80% of the surveyor&apos;s valuation and the rate at 30%, both fixed in code.
        </p>
      </div>

      <div className="glass-panel glass-card-glow space-y-6 rounded-3xl p-6 sm:p-8 lg:col-span-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-400">Facility</p>
            <p className="text-2xl font-bold text-white">{formatUsdc(principal, { whole: true })}</p>
            <p className="text-[11px] text-slate-500">Committed at approval</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Per stage</p>
            <p className="text-2xl font-bold text-emerald-400">{formatUsdc(trancheFor(principal, 0), { whole: true })}</p>
            <p className="text-[11px] text-slate-500">Paid to the trustee on sign-off</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-6">
          <div>
            <p className="text-xs text-slate-400">First instalment</p>
            <p className="text-3xl font-extrabold text-sky-400">{formatUsdc(projection.firstPayment)}</p>
            <p className="text-[11px] text-slate-500">Once fully drawn</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Final instalment</p>
            <p className="text-3xl font-extrabold text-white">{formatUsdc(projection.lastPayment)}</p>
            <p className="text-[11px] text-slate-500">Payments fall as the balance does</p>
          </div>
        </div>
        <div className="space-y-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Principal per month</span>
            <span className="font-semibold text-slate-200">
              {formatUsdc(principal / BigInt(years * 12))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total interest</span>
            <span className="font-semibold text-slate-200">{formatUsdc(projection.totalInterest)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total repaid</span>
            <span className="font-semibold text-slate-200">{formatUsdc(projection.totalPaid)}</span>
          </div>
        </div>
        <ol className="grid grid-cols-5 gap-1 text-center text-[10px] text-slate-500">
          {STAGE_NAMES.map((name, i) => (
            <li key={name} className="space-y-1">
              <span className="block h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" style={{ opacity: 0.4 + i * 0.15 }} />
              {name}
            </li>
          ))}
        </ol>
        <p className="text-xs leading-relaxed text-slate-500">
          Constant amortisation, as charged on-chain: each month&apos;s interest on the drawn balance plus a fixed slice
          of principal. Interest is only charged on money already released, so payments start lower while the house is
          going up.
        </p>
        <Link
          href="/properties"
          className="block w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 py-3.5 text-center font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 hover:opacity-95"
        >
          Find a property to build on
        </Link>
      </div>
    </div>
  );
}
