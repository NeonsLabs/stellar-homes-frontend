import React from "react";
import Link from "next/link";
import Calculator from "@/components/home/Calculator";
import LiveStats from "@/components/home/LiveStats";

const STEPS = [
  {
    title: "Register",
    body: "A trustee on the ground registers the plot with digests of its title deed and survey. The five construction stages are created with it, so the schedule exists before anyone lends against it.",
  },
  {
    title: "Verify and value",
    body: "An oracle confirms the title against the land registry and a licensed surveyor publishes a valuation. Nobody can verify or value a property they hold in trust.",
  },
  {
    title: "Apply and approve",
    body: "The borrower applies for up to 80% of the valuation. An underwriter approves, and the whole facility is committed against the lending pool at once, so the money cannot vanish mid-build.",
  },
  {
    title: "Build, stage by stage",
    body: "The trustee submits evidence for a stage and an inspector signs it off, in order. Only then is that stage's tranche released, to the trustee running the build, never to the borrower.",
  },
  {
    title: "Repay",
    body: "Interest accrues monthly on what has actually been drawn. Payments clear interest first, then principal. Pay more to shorten the loan, or clear it at any time.",
  },
];

const CONTRACTS = [
  {
    tag: "01 / Registry",
    name: "PropertyRegistry",
    tone: "text-sky-400",
    body: "What a property is, who holds it in trust, whether its title is clean, what it is worth, and how far the build has got. Holds no money.",
    fns: ["submit_property", "verify_title", "set_valuation", "submit_milestone_evidence", "verify_milestone"],
  },
  {
    tag: "02 / Capital",
    name: "LendingPool",
    tone: "text-emerald-400",
    body: "The investors' capital: deposits, commitments, disbursement and yield. Holds every cent, and does not know what a mortgage is.",
    fns: ["deposit", "withdraw", "claim_interest", "available", "pool_state"],
  },
  {
    tag: "03 / Loans",
    name: "MortgagePool",
    tone: "text-amber-400",
    body: "The loan: application, underwriting, milestone-gated release, repayment and default. Decides what is owed and holds nothing.",
    fns: ["apply", "approve", "disburse", "repay", "mark_default"],
  },
];

const ROLES = [
  { href: "/properties", role: "Borrower", body: "Apply against a verified property, watch your house go up, and repay monthly." },
  { href: "/invest", role: "Investor", body: "Fund the pool and earn the interest every mortgage pays." },
  { href: "/trustee", role: "Trustee", body: "Register plots, submit build evidence, and receive each tranche." },
  { href: "/oracle", role: "Oracle", body: "Verify titles, publish valuations and sign off construction stages." },
  { href: "/underwriter", role: "Underwriter", body: "Approve or decline applications against the pool's capital." },
];

export default function LandingPage() {
  return (
    <main className="relative">
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 md:pt-24 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-sky-400 uppercase">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
              Soroban smart contracts on Stellar
            </span>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Build back home,
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                one verified stage at a time
              </span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
              A mortgage for building in Lagos, Accra or Nairobi from abroad. The money is never handed over in one
              lump: it is released one construction stage at a time, and only for a stage an inspector has signed off.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/properties"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-center font-bold text-white shadow-lg shadow-sky-500/10 transition-all hover:-translate-y-0.5 hover:opacity-95"
              >
                Browse properties
              </Link>
              <a
                href="#calculator"
                className="glass-panel rounded-xl px-8 py-4 text-center font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/5"
              >
                Estimate a mortgage
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="glass-panel glass-card-glow relative overflow-hidden rounded-3xl p-8 shadow-2xl">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-sky-500/20 blur-2xl" />
              <p className="text-xs font-semibold text-slate-500 uppercase">How a facility is released</p>
              <ol className="mt-5 space-y-3">
                {["Foundation", "Walls", "Roofing", "Finishing", "Handover"].map((stage, i) => (
                  <li key={stage} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                        i < 2
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : i === 2
                            ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                            : "border-slate-700 text-slate-500"
                      }`}
                    >
                      {i < 2 ? "✓" : i + 1}
                    </span>
                    <span className={i < 3 ? "text-slate-200" : "text-slate-500"}>{stage}</span>
                    <span className="ml-auto text-xs text-slate-500">
                      {i < 2 ? "20% released" : i === 2 ? "awaiting sign-off" : "20%"}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" />
              </div>
              <p className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs leading-relaxed text-slate-400">
                Stages are signed off in order, so nobody draws the roofing tranche on a poured foundation. Interest is
                only charged on what has been released.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LiveStats />

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
          <p className="text-slate-400">
            The protocol cannot see a building. What it guarantees is procedure: money moves only in the order the build
            is supposed to happen, only on a signature from someone who is not the trustee.
          </p>
        </div>
        <ol className="grid gap-4 md:grid-cols-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="glass-panel rounded-3xl p-6">
              <span className="text-xs font-bold text-sky-400">0{i + 1}</span>
              <h3 className="mt-2 mb-2 text-lg font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-sm">
          <Link href="/learn" className="font-semibold text-sky-300 hover:underline">
            Read the details: interest, default, and what stays off-chain →
          </Link>
        </p>
      </section>

      <section id="calculator" className="scroll-mt-20 border-t border-white/5 bg-slate-900/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">Same maths as the chain</span>
            <h2 className="text-3xl font-bold md:text-4xl">Estimate your mortgage</h2>
            <p className="text-slate-400">
              Projected with the MortgagePool&apos;s integer arithmetic, not an approximation of it.
            </p>
          </div>
          <Calculator />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
          <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">On-chain layer</span>
          <h2 className="text-3xl font-bold md:text-4xl">Three contracts, each with one job</h2>
          <p className="text-slate-400">
            The contract holding the money is never the contract deciding whose it is. Neither can, alone, pay the
            wrong party.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CONTRACTS.map((c) => (
            <div key={c.name} className="space-y-4 rounded-3xl border border-white/5 bg-[#161f30]/50 p-8">
              <p className={`text-xs font-bold tracking-wide uppercase ${c.tone}`}>{c.tag}</p>
              <h3 className="text-xl font-bold">{c.name}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{c.body}</p>
              <ul className="space-y-1 pt-2 font-mono text-xs text-slate-500">
                {c.fns.map((f) => (
                  <li key={f}>• {f}()</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 bg-slate-900/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">Pick your role</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ROLES.map((r) => (
              <Link key={r.role} href={r.href} className="glass-panel hover-glow rounded-3xl p-6">
                <h3 className="mb-2 text-lg font-bold text-white">{r.role}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{r.body}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-sky-300">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
