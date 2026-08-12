import type { Metadata } from "next";
import Link from "next/link";
import KycForm from "@/components/kyc/KycForm";

export const metadata: Metadata = {
  title: "Identity Verification | StellarHomes",
  description:
    "Complete your KYC verification to hold compliant PROP tokens and access milestone-gated home financing on StellarHomes.",
};

export default function KycPage() {
  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-[#f8fafc] selection:bg-sky-500 selection:text-white">
      {/* Ambient gradients, clipped by their own wrapper so the blur radius
          cannot widen the page on small screens. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
      </div>

      <header className="glass-panel sticky top-0 z-50 border-b border-white/5">
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="StellarHomes home">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 shadow-lg shadow-sky-500/20">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">
              Stellar<span className="text-sky-400">Homes</span>
            </span>
          </Link>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400">
            Secure form
          </span>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl space-y-8 px-6 py-10 md:py-14">
        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
            Step 1 of onboarding
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Verify your identity
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
            PROP tokens are issued with compliance flags enabled, so your Stellar
            account must be verified before it can hold property equity or draw a
            mortgage. This usually takes one business day.
          </p>
        </div>

        <KycForm />

        <p className="text-xs leading-relaxed text-slate-600">
          Your documents are used solely for identity verification and are handled
          under our data protection policy. StellarHomes will never ask for your
          wallet&apos;s secret key.
        </p>
      </main>
    </div>
  );
}
