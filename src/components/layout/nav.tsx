import React from "react";
import Link from "next/link";

export const NAV = [
  { href: "/properties", label: "Properties" },
  { href: "/dashboard", label: "My Mortgages" },
  { href: "/invest", label: "Invest" },
  { href: "/trustee", label: "Trustee" },
  { href: "/oracle", label: "Oracle" },
  { href: "/underwriter", label: "Underwriter" },
  { href: "/ledger", label: "Ledger" },
];

export const SECONDARY_NAV = [
  { href: "/kyc", label: "KYC" },
  { href: "/learn", label: "How it works" },
  { href: "/admin", label: "Admin" },
];

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 shadow-lg shadow-sky-500/20">
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </span>
      <span className="text-lg font-bold text-white">
        Stellar<span className="text-sky-400">Homes</span>
      </span>
    </Link>
  );
}
