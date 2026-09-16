import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { projectFullyDrawn } from "@/lib/amortization";
import { formatUsdc, USDC_DECIMALS } from "@/lib/format";

export const metadata: Metadata = {
  title: "How it works",
  description: "How StellarHomes mortgages are released, charged, repaid and written off, as the contracts enforce it.",
};

const EXAMPLE_PRINCIPAL = 100_000n * 10n ** BigInt(USDC_DECIMALS);
const EXAMPLE = projectFullyDrawn(EXAMPLE_PRINCIPAL, 120, 850);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-panel space-y-3 rounded-3xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="space-y-3 leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export default function LearnPage() {
  const [first, second] = EXAMPLE.instalments;
  const last = EXAMPLE.instalments[EXAMPLE.instalments.length - 1];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Learn" title="How a StellarHomes mortgage works">
        What the contracts enforce, in plain language. When this page and the chain disagree, the chain is right.
      </PageHeader>

      <div className="space-y-6">
        <Section title="Money follows the building">
          <p>
            A mortgage is never paid out in one lump. The facility is split into five equal tranches, one for each
            construction stage: foundation, walls, roofing, finishing and handover. A tranche is released only after
            the trustee has submitted evidence for that stage and an inspector has signed it off.
          </p>
          <p>
            Stages are signed off in order, so nobody draws the roofing tranche on a poured foundation. The money goes
            to the trustee running the build, never to the borrower. Once a stage is signed off, anyone may trigger the
            release: the trustee does not have to wait for the platform.
          </p>
        </Section>

        <Section title="How much you can borrow">
          <p>
            Up to <strong>80%</strong> of the surveyor&apos;s valuation. The property&apos;s title must first be
            verified against the land registry. Both the 80% ceiling and the 30% rate cap are fixed in the contract&apos;s
            code, so changing them needs a contract upgrade behind a public timelock.
          </p>
          <p>
            When an underwriter approves, the whole facility is committed against the lending pool at once. Investors
            cannot withdraw it while the house is being built, so a borrower whose foundation passes inspection will not
            find the money gone.
          </p>
        </Section>

        <Section title="Interest and repayment">
          <p>
            Interest is charged monthly (every 30 days) on the balance actually drawn. Each instalment is that
            month&apos;s interest plus a fixed slice of principal: the facility divided by the term. This is{" "}
            <strong>constant amortisation</strong>, so payments fall as the balance does. It is not the level-payment
            annuity most calculators show, because an annuity cannot be computed exactly in integers. This can, so
            anyone can check what the chain charges by hand.
          </p>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm">
            <p className="mb-2 font-semibold text-white">
              Example: {formatUsdc(EXAMPLE_PRINCIPAL, { whole: true })} over 10 years at 8.50%, fully drawn
            </p>
            <ul className="space-y-1 text-slate-400">
              <li>
                Month 1: {formatUsdc(first.interest)} interest + {formatUsdc(first.principal)} principal ={" "}
                <span className="text-white">{formatUsdc(first.payment)}</span>
              </li>
              <li>
                Month 2: {formatUsdc(second.interest)} interest + {formatUsdc(second.principal)} principal ={" "}
                <span className="text-white">{formatUsdc(second.payment)}</span>
              </li>
              <li>
                Month {last.number}: <span className="text-white">{formatUsdc(last.payment)}</span>
              </li>
              <li>
                Total interest: <span className="text-white">{formatUsdc(EXAMPLE.totalInterest)}</span>
              </li>
            </ul>
          </div>
          <p>
            Payments clear interest first, then principal. Each payment must be at least the instalment due, or the full
            payoff. Paying more shortens the loan, and you can clear it outright at any time. Interest is only charged on
            money already disbursed, so a build that has stalled at the foundation does not pay for a roof.
          </p>
          <p>
            One thing to know: the first repayment moves a loan from <em>Funded</em> to <em>Repaying</em>, and the
            contract releases no further tranches after that. The undrawn part of the facility goes back to the pool
            when the loan is paid off.
          </p>
        </Section>

        <Section title="If a payment is missed">
          <p>
            Once an instalment is unpaid past the grace period (14 days by default), anyone may write the loan off. The
            platform cannot keep a bad loan off the books by declining to act. The undrawn facility returns to the pool,
            and the drawn balance is written off against investors&apos; capital, which is the risk investors take.
          </p>
        </Section>

        <Section title="What stays off-chain">
          <p>
            No title deed, survey, photograph or identity is ever published. The registry stores only 32-byte SHA-256
            digests. Documents are shared with the parties who need them, and anyone holding a copy can prove it
            unaltered. This app hashes files in your browser and never uploads them. KYC runs entirely in the backend.
          </p>
        </Section>

        <Section title="Who can do what">
          <ul className="list-inside list-disc space-y-1 text-slate-300">
            <li>
              <strong>Trustee</strong>: registers properties, submits stage evidence, receives tranches.
            </li>
            <li>
              <strong>Oracle</strong>: verifies titles, publishes valuations, signs off stages, never on a property it
              holds in trust.
            </li>
            <li>
              <strong>Underwriter</strong>: approves or declines applications.
            </li>
            <li>
              <strong>Borrower</strong> and <strong>investor</strong>: any KYC-verified Stellar wallet.
            </li>
            <li>
              <strong>Admin</strong>: a multisig that registers roles. It has no path to anyone&apos;s money.
            </li>
            <li>
              <strong>Anyone</strong>: releases a signed-off tranche, or writes off a loan past its grace period.
            </li>
          </ul>
        </Section>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link href="/properties" className="glass-btn-primary">
            Browse properties
          </Link>
          <Link href="/invest" className="glass-btn-secondary">
            Invest in the pool
          </Link>
        </div>
      </div>
    </main>
  );
}
