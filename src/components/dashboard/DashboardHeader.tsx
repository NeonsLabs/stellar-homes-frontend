import React from "react";
import Link from "next/link";
import { Badge } from "./StatusBadge";
import { truncateHash } from "@/lib/format";
import type { BorrowerProfile } from "@/types/dashboard";

const NAV_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#milestones", label: "Milestones" },
  { href: "#payments", label: "Payments" },
];

/** Sticky top bar for the borrower dashboard: brand, section nav, wallet chip. */
export default function DashboardHeader({
  borrower,
}: {
  borrower: BorrowerProfile;
}) {
  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-white/5">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
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
          <span className="hidden text-xl font-bold sm:block">
            Stellar<span className="text-sky-400">Homes</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {borrower.kycVerified && (
            <Badge tone="emerald" className="hidden sm:inline-flex">
              KYC verified
            </Badge>
          )}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-white">{borrower.name}</p>
              <p className="font-mono text-[10px] text-slate-500">
                {truncateHash(borrower.walletAddress, 4, 4)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
